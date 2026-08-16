#!/usr/bin/env python3
"""抓取微商相册全店商品与高清原图，导出 data/products.json。"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse, urlencode

import requests

BASE_HOST = "https://a2018011223324130320.wgstores.com"
ALBUM_ID = "_Z0wqfTEPPIszgzMqnFMbW7l-wsL8_g1g"
API_URL = f"{BASE_HOST}/album/personal/all"
REFERER = f"{BASE_HOST}/weshop/goods_list/{ALBUM_ID}"

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
UPLOAD_ROOT = ROOT / "public" / "uploads" / "goods"
OUTPUT_JSON = DATA_DIR / "products.json"

PAGE_SLEEP = 0.35
IMG_SLEEP = 0.08
TIMEOUT = 40

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Origin": BASE_HOST,
    "Referer": REFERER,
    "x-wg-module": "indsite",
    "x-wg-language": "zh",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
    ),
}

CATEGORY_RULES = [
    ("迪通拿", ("迪通拿", "daytona", "116500", "126500")),
    ("水鬼", ("水鬼", "黑水鬼", "绿水鬼", "蓝水鬼", "submariner", "潜航者", "116610", "126610")),
    ("劳力士", ("劳力士", "rolex", "日志", "游艇", "格林尼治", "探险家", "空中霸王", "星期日历")),
    ("爱彼", ("爱彼", "ap ", "royal oak", "皇家橡树", "audemars")),
    ("百达翡丽", ("百达翡丽", "patek", "鹦鹉螺", "nautilus", "5726", "5711")),
    ("欧米茄", ("欧米茄", "omega", "海马", "超霸", "碟飞", "seamaster")),
    ("卡地亚", ("卡地亚", "cartier", "蓝气球", "山度士", "tank")),
    ("浪琴", ("浪琴", "longines", "康卡斯", "名匠")),
    ("江诗丹顿", ("江诗丹顿", "vc ", "vacheron")),
    ("理查德米尔", ("理查德米尔", "richard mille", "rm ")),
]


def load_cookie() -> str:
    env = os.environ.get("WG_COOKIE", "").strip()
    if env:
        return env
    cookie_file = ROOT / "cookies.txt"
    if cookie_file.exists():
        return cookie_file.read_text(encoding="utf-8").strip()
    return ""


def first(*values: Any) -> Any:
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and not value.strip():
            continue
        if isinstance(value, (list, dict)) and not value:
            continue
        return value
    return None


def infer_category(title: str, tags: list[str], description: str) -> str:
    blob = " ".join([title, " ".join(tags), description]).lower()
    for name, keys in CATEGORY_RULES:
        if any(key.lower() in blob for key in keys):
            return name
    if tags:
        return tags[0]
    return "其他"


def parse_price(item: dict[str, Any]) -> tuple[float, str]:
    raw = first(
        item.get("price"),
        item.get("priceStr"),
        item.get("min_price"),
        item.get("itemPrice"),
        item.get("goods_price"),
        item.get("salePrice"),
        item.get("mark_price"),
    )
    text = "" if raw is None else str(raw).strip()
    if isinstance(raw, (int, float)):
        return float(raw), text or f"{raw:g}"
    digits = re.sub(r"[^\d.]", "", text)
    try:
        return (float(digits) if digits else 0.0), text
    except ValueError:
        return 0.0, text


def collect_tags(item: dict[str, Any]) -> list[str]:
    tags: list[str] = []
    raw = first(item.get("tagList"), item.get("tags"), item.get("goods_tags"), item.get("sub_title"))
    if isinstance(raw, str):
        tags.extend([part.strip() for part in re.split(r"[,，/|]", raw) if part.strip()])
    elif isinstance(raw, list):
        for entry in raw:
            if isinstance(entry, str) and entry.strip():
                tags.append(entry.strip())
            elif isinstance(entry, dict):
                name = first(entry.get("tagName"), entry.get("name"), entry.get("title"), entry.get("label"))
                if name:
                    tags.append(str(name).strip())
    seen: set[str] = set()
    unique: list[str] = []
    for tag in tags:
        if tag not in seen:
            seen.add(tag)
            unique.append(tag)
    return unique


def hd_candidates(url: str) -> list[str]:
    if not url:
        return []
    url = url.strip()
    variants = [url]
    stripped = re.sub(r"[?&](imageView2|imageMogr2|x-oss-process)[^&]*", "", url)
    stripped = stripped.rstrip("?&")
    variants.append(stripped)
    variants.append(re.sub(r"!.*$", "", stripped))
    variants.append(re.sub(r"_min(\.[A-Za-z0-9]+)$", r"\1", stripped))
    variants.append(re.sub(r"_\d+x\d+(\.[A-Za-z0-9]+)$", r"\1", stripped))
    ordered: list[str] = []
    seen: set[str] = set()
    for candidate in variants:
        if candidate and candidate not in seen:
            seen.add(candidate)
            ordered.append(candidate)
    # Prefer likely originals first
    ordered.sort(key=lambda u: ("imageView" in u or "_min" in u or "!" in u, len(u)))
    return ordered


def collect_image_urls(item: dict[str, Any]) -> list[str]:
    urls: list[str] = []

    def push(value: Any) -> None:
        if not value:
            return
        if isinstance(value, str):
            if value.startswith("http"):
                urls.append(value)
            return
        if isinstance(value, list):
            for entry in value:
                push(entry)
            return
        if isinstance(value, dict):
            push(
                first(
                    value.get("originalUrl"),
                    value.get("originUrl"),
                    value.get("url"),
                    value.get("src"),
                    value.get("picUrl"),
                    value.get("imgSrc"),
                )
            )

    for key in (
        "originalImgs",
        "originImgs",
        "hdImgs",
        "imgsSrc",
        "imgs",
        "photoUrls",
        "goods_pic_list",
        "pic_list",
        "pictures",
        "images",
        "newImgs",
        "imgList",
    ):
        push(item.get(key))

    cover = first(item.get("cover"), item.get("icon"), item.get("goods_pic"))
    push(cover)

    unique: list[str] = []
    seen: set[str] = set()
    for url in urls:
        key = hd_candidates(url)[0]
        if key not in seen:
            seen.add(key)
            unique.append(url)
    return unique


def extract_item(item: dict[str, Any]) -> dict[str, Any] | None:
    goods_id = first(
        item.get("goods_id"),
        item.get("goodsId"),
        item.get("item_id"),
        item.get("itemId"),
        item.get("id"),
        item.get("albumItemId"),
    )
    title = first(
        item.get("title"),
        item.get("goods_name"),
        item.get("itemName"),
        item.get("name"),
        item.get("goodsName"),
    )
    description = first(
        item.get("goods_desc"),
        item.get("caption"),
        item.get("item_caption"),
        item.get("note"),
        item.get("content"),
        item.get("desc"),
        item.get("text"),
        "",
    )
    if not goods_id:
        return None
    goods_id = str(goods_id)
    title = str(title or "未命名商品").strip() or "未命名商品"
    description = str(description or "").replace("\r\n", "\n").strip()
    tags = collect_tags(item)
    price, price_text = parse_price(item)
    category = infer_category(title, tags, description)
    return {
        "id": goods_id,
        "title": title,
        "category": category,
        "tags": tags,
        "description": description,
        "price": price,
        "priceText": price_text,
        "remoteImages": collect_image_urls(item),
        "images": [],
    }


def request_page(session: requests.Session, timestamp: str) -> dict[str, Any]:
    params = {
        "albumId": ALBUM_ID,
        "searchValue": "",
        "searchImg": "",
        "startDate": "",
        "endDate": "",
        "sourceId": "",
        "slipType": "1",
        "requestDataType": "",
        "timestamp": timestamp,
    }
    url = f"{API_URL}?{urlencode(params)}"
    last_error: Exception | None = None
    for method in ("POST", "GET"):
        try:
            if method == "POST":
                response = session.post(
                    url,
                    data={"tagList": "[]"},
                    timeout=TIMEOUT,
                )
            else:
                response = session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict):
                raise ValueError("接口未返回 JSON 对象")
            return payload
        except Exception as exc:  # noqa: BLE001
            last_error = exc
    raise RuntimeError(f"请求失败: {last_error}") from last_error


def download_images(session: requests.Session, goods_id: str, urls: list[str]) -> list[str]:
    folder = UPLOAD_ROOT / goods_id
    folder.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    for index, remote in enumerate(urls, start=1):
        suffix = Path(urlparse(hd_candidates(remote)[0]).path).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}:
            suffix = ".jpg"
        filename = f"{index:02d}{suffix}"
        dest = folder / filename
        relative = f"/uploads/goods/{goods_id}/{filename}"
        if dest.exists() and dest.stat().st_size > 0:
            saved.append(relative)
            continue
        content: bytes | None = None
        for candidate in hd_candidates(remote):
            try:
                response = session.get(candidate, timeout=TIMEOUT, stream=True)
                if response.status_code == 200 and response.content:
                    content = response.content
                    break
            except requests.RequestException:
                continue
        if not content:
            print(f"  ! 图片下载失败: {remote}")
            continue
        dest.write_bytes(content)
        saved.append(relative)
        time.sleep(IMG_SLEEP)
    return saved


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update(HEADERS)
    cookie = load_cookie()
    if cookie:
        session.headers["Cookie"] = cookie

    products: list[dict[str, Any]] = []
    timestamp = "0"
    page = 1
    seen_ids: set[str] = set()

    print(f"开始抓取相册 {ALBUM_ID}")
    while True:
        print(f"→ 第 {page} 页, timestamp={timestamp}")
        payload = request_page(session, timestamp)
        errcode = payload.get("errcode")
        if errcode not in (None, 0, "0") and not payload.get("success", True):
            errmsg = payload.get("errmsg") or payload.get("message") or str(payload)
            print("接口返回错误:", errmsg)
            if "登录" in str(errmsg) or errcode in (9, "9"):
                print(
                    "该独立站接口需要登录态。请在浏览器打开商品列表页，"
                    "F12 → Network 复制 Cookie，保存为项目根目录 cookies.txt，"
                    "或设置环境变量 WG_COOKIE 后重新运行。"
                )
            return 1

        result = payload.get("result") or payload.get("data") or {}
        items = result.get("items") or result.get("list") or []
        pagination = result.get("pagination") or {}
        print(f"  本页 {len(items)} 条")

        if page == 1 and items and isinstance(items[0], dict):
            print("  字段样例:", ", ".join(list(items[0].keys())[:24]))

        for raw in items:
            if not isinstance(raw, dict):
                continue
            extracted = extract_item(raw)
            if not extracted or extracted["id"] in seen_ids:
                continue
            seen_ids.add(extracted["id"])
            print(f"  下载 #{extracted['id']} {extracted['title'][:40]}")
            extracted["images"] = download_images(
                session, extracted["id"], extracted.pop("remoteImages")
            )
            products.append(extracted)

        has_more = bool(pagination.get("isLoadMore") or pagination.get("hasMore"))
        next_ts = pagination.get("pageTimestamp") or pagination.get("timestamp")
        if not has_more or not items or not next_ts or str(next_ts) == str(timestamp):
            break
        timestamp = str(next_ts)
        page += 1
        time.sleep(PAGE_SLEEP)

    OUTPUT_JSON.write_text(
        json.dumps(products, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"完成：{len(products)} 件商品 → {OUTPUT_JSON}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n已中断")
        sys.exit(130)
