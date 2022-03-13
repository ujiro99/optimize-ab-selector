import * as Optimize from "@/services/googleOptimize";

const testParseTable = [
  ["GAX1.3.-f48SgmLRl2mLm7ERqfkUg.19059.1", 1, "-f48SgmLRl2mLm7ERqfkUg", "1"],
  [
    "GAX1.3.-f48SgmLRl2mLm7ERqfkUg.19059.1!FEJwvaarSEWFcD8-VljYcA.19059.1",
    2,
    "-f48SgmLRl2mLm7ERqfkUg",
    "1",
    "FEJwvaarSEWFcD8-VljYcA",
    "1",
  ],
  [
    "GAX1.2.6VCqQqb7TgaiXm97jv8fWg.19062.1!k8OcJx9eT-m4yZBVMSB0bg.19063.1",
    2,
    "6VCqQqb7TgaiXm97jv8fWg",
    "1",
    "k8OcJx9eT-m4yZBVMSB0bg",
    "1",
  ],
  ["GAX1.2.vpP-fyOUTI6IzC3p-tJ1yQ.19102.0", 1, "vpP-fyOUTI6IzC3p-tJ1yQ", "0"],
  [
    "GAX1.2.PVVe93HuT_GAS1P6giQ9tw.19046.1!aZof_3REQcCEq8OOsWbFrA.18926.2!2I3o7fSYQoCQSXiXZd84Cg.18926.3",
    3,
    "PVVe93HuT_GAS1P6giQ9tw",
    "1",
    "aZof_3REQcCEq8OOsWbFrA",
    "2",
    "2I3o7fSYQoCQSXiXZd84Cg",
    "3",
  ],
];

describe.each(testParseTable)(
  `parseGaexp %s`,
  (str: string, num: number, ...result) => {
    test(`returns ${num} items`, () => {
      const experiments = Optimize.parseGaexp(str);
      expect(experiments.length).toBe(num);
      for (let i = 0; i < num; i++) {
        const ex = experiments[i];
        expect(ex.testId).toBe(result[2 * i]);
        expect(ex.pattern).toBe(result[2 * i + 1]);
      }
    });
  }
);
