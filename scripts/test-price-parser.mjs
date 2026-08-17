import { parsePriceOptions, displayPriceSummary } from "../src/lib/priceOptions.ts";

const samples = [
  "配置：\n1，Clean厂外壳+3235机芯，P2350。\n2，VS外壳+3235机芯，P4100。",
  "黑钢迪\n通货壳+7750机芯=1350（不耐用）\nC壳+4130机=2800\n顶级壳+4130机=4900",
  "价格 1350/2800/4500 欢迎咨询",
  "蓝气球\n西铁城机芯=950\n海鸥机芯=1500\n原版机芯=2600",
  "P150 Chrome Hearts 太阳镜",
];

for (const s of samples) {
  const opts = parsePriceOptions(s);
  console.log("---");
  console.log(s.slice(0, 60).replace(/\n/g, " | "));
  console.log(opts.map((o) => `${o.label}:${o.price}`).join(" | "));
  console.log("display:", displayPriceSummary(s));
}
