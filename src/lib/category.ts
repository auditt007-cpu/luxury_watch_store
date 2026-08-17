export const MAJOR_CATEGORIES = ["全部", "腕表", "眼镜", "包包", "鞋靴"] as const;

export type MajorCategory = Exclude<(typeof MAJOR_CATEGORIES)[number], "全部">;

const MAJOR_SET = new Set<string>(MAJOR_CATEGORIES.filter((item) => item !== "全部"));

const CATEGORY_ALIASES: Record<string, MajorCategory> = {
  手表: "腕表",
  腕表: "腕表",
  "腕表/手表": "腕表",
  眼镜: "眼镜",
  太阳镜: "眼镜",
  墨镜: "眼镜",
  包包: "包包",
  皮具: "包包",
  "包包/皮具": "包包",
  鞋子: "鞋靴",
  鞋靴: "鞋靴",
  劳力士: "腕表",
  水鬼: "腕表",
  迪通拿: "腕表",
  爱彼: "腕表",
  百达翡丽: "腕表",
  欧米茄: "腕表",
  卡地亚: "腕表",
  浪琴: "腕表",
  沛纳海: "腕表",
  万国iwc: "腕表",
  万国: "腕表",
  江诗丹顿: "腕表",
  蚝式: "腕表",
  sub: "腕表",
  gmt: "腕表",
  手雷: "腕表",
  坦克: "腕表",
  dior: "包包",
  芬迪鞋: "鞋靴",
  杰尼亚鞋: "鞋靴",
  lv休闲鞋: "鞋靴",
  迪奥鞋: "鞋靴",
  gucci鞋: "鞋靴",
  普拉达鞋: "鞋靴",
  lp鞋: "鞋靴",
  爱马仕鞋: "鞋靴",
  万宝龙眼镜: "眼镜",
  lv眼镜: "眼镜",
  克罗心眼镜: "眼镜",
  tf眼镜: "眼镜",
  dior眼镜: "眼镜",
  gucci太阳镜: "眼镜",
};

const RULES: { category: MajorCategory; keywords: string[]; weight: number }[] = [
  {
    category: "眼镜",
    weight: 6,
    keywords: [
      "墨镜",
      "太阳镜",
      "眼镜",
      "镜框",
      "光学镜",
      "近视镜",
      "gentle monster",
      "gm ",
      " gm",
      "tom ford",
      "chrome hearts",
      "克罗心",
      "万宝龙眼镜",
      "雷朋",
      "ray-ban",
      "rayban",
      "sunglasses",
      "sunglass",
      "eyewear",
      "glasses",
      "optical",
      "cartier glasses",
      "ct0",
    ],
  },
  {
    category: "鞋靴",
    weight: 6,
    keywords: [
      "运动鞋",
      "休闲鞋",
      "德比",
      "derby",
      "皮鞋",
      "板鞋",
      "跑鞋",
      "靴子",
      "短靴",
      "乐福鞋",
      "高跟鞋",
      "拖鞋",
      "凉鞋",
      "球鞋",
      "dunk",
      "jordan",
      "air force",
      "air jordan",
      "aj1",
      "aj ",
      " nike",
      "adidas",
      "yeezy",
      "lp鞋",
      "芬迪鞋",
      "杰尼亚鞋",
      "迪奥鞋",
      "gucci鞋",
      "普拉达鞋",
      "爱马仕鞋",
    ],
  },
  {
    category: "包包",
    weight: 6,
    keywords: [
      "手袋",
      "托特包",
      "tote",
      "水桶包",
      "信使包",
      "马鞍包",
      "洗漱包",
      "手拿包",
      "双肩包",
      "背包",
      "钱包",
      "卡包",
      "公文包",
      "斜挎",
      "louis vuitton",
      "louisvuitton",
      "chanel",
      "hermes",
      "hermès",
      "爱马仕",
      "香奈儿",
      "birkin",
      "kelly",
      "neverfull",
      "speedy",
    ],
  },
  {
    category: "腕表",
    weight: 5,
    keywords: [
      "劳力士",
      "欧米茄",
      "百达翡丽",
      "水鬼",
      "机芯",
      "腕表",
      "手表",
      "爱彼",
      "卡地亚",
      "浪琴",
      "沛纳海",
      "江诗丹顿",
      "万国",
      "蚝式",
      "迪通拿",
      "rolex",
      "omega",
      "patek",
      "audemars",
      "iwc",
      "panerai",
      "cartier",
      "longines",
      "vacheron",
      "submariner",
      "daytona",
      "gmt",
      "手雷",
      "坦克",
    ],
  },
];

function normalizeCategory(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function looksLikeEyewear(text: string) {
  const blob = text.toLowerCase();
  const keywords = [
    "墨镜",
    "太阳镜",
    "太阳眼镜",
    "眼镜",
    "镜框",
    "光学镜",
    "近视镜",
    "蛤蟆镜",
    "镜片",
    "镜腿",
    "sunglasses",
    "sunglass",
    "eyewear",
    "glasses",
    "optical",
  ];
  if (keywords.some((word) => blob.includes(word))) return true;
  if (/\bct0\d{3}/i.test(blob)) return true;
  if (/model[：:]\s*ct/i.test(blob)) return true;
  if (/\d{2}\s*[口□]\s*\d{2}/.test(blob)) return true;
  if (/\d{2}\s*[-–]\s*\d{2}\s*[-–]\s*1[34]\d/.test(blob)) return true;
  return false;
}

export function resolveMajorCategory(
  category: string,
  title = "",
  description = "",
  tags: string[] = [],
): MajorCategory | "其他" {
  const raw = category.trim();
  const blob = `${category} ${title} ${description} ${tags.join(" ")}`;
  if (looksLikeEyewear(blob)) return "眼镜";

  if (MAJOR_SET.has(raw)) return raw as MajorCategory;

  const alias = CATEGORY_ALIASES[normalizeCategory(raw)] || CATEGORY_ALIASES[raw];
  if (alias) return alias;

  const scores: Record<MajorCategory, number> = {
    腕表: 0,
    眼镜: 0,
    包包: 0,
    鞋靴: 0,
  };

  const lower = blob.toLowerCase();
  for (const rule of RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        scores[rule.category] += rule.weight;
      }
    }
  }

  const ranked = (Object.entries(scores) as [MajorCategory, number][]).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] > 0) return ranked[0][0];
  return "其他";
}

export function matchesMajorCategory(
  selected: string,
  category: string,
  title = "",
  description = "",
  tags: string[] = [],
) {
  if (!selected || selected === "全部") return true;
  const major = resolveMajorCategory(category, title, description, tags);
  if (selected === "腕表" || selected === "手表" || selected === "腕表/手表") {
    return major === "腕表";
  }
  if (selected === "包包" || selected === "皮具" || selected === "包包/皮具") {
    return major === "包包";
  }
  if (selected === "鞋子" || selected === "鞋靴") return major === "鞋靴";
  if (selected === "眼镜") return major === "眼镜";
  return major === selected || category === selected;
}
