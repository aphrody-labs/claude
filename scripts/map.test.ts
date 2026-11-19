import { describe, expect, test } from "bun:test";
import { bucket, render } from "./map.ts";

describe("map", () => {
  test("buckets root files, plugins and plain directories", () => {
    expect(bucket("README.md")).toBe("(root)");
    expect(bucket("packages/aphrody/skills/x/SKILL.md")).toBe(
      "packages/aphrody",
    );
    expect(bucket("scripts/lib.ts")).toBe("scripts");
  });

  test("renders sorted rows with tier and gate, falling back to default", () => {
    const out = render(
      [
        { rel: "scripts/a.ts", size: 3 },
        { rel: "scripts/b.ts", size: 4 },
        { rel: "docs/x.md", size: 5 },
        { rel: "a.json", size: 1 },
      ],
      {
        default: { tier: "misc", gate: "g" },
        scripts: { tier: "typed-bun", gate: "bun test scripts" },
      },
    );
    expect(out).toBe(
      "dir\ttier\tfiles\tbytes\tgate\n(root)\tmisc\t1\t1\tg\ndocs\tmisc\t1\t5\tg\nscripts\ttyped-bun\t2\t7\tbun test scripts\n",
    );
  });
});
