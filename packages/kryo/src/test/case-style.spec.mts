import { assert as chaiAssert } from "chai";

import { detectCaseStyle, join, rename, split } from "../lib/_helpers/case-style.mjs";
import { CaseStyle } from "../lib/index.mjs";

describe("rename", function () {
  describe("detectCaseStyle", function () {
    interface Item {
      identifier: string;
      expected: CaseStyle;
    }

    const items: Item[] = [
      {identifier: "id", expected: CaseStyle.CamelCase},
      {identifier: "Id", expected: CaseStyle.PascalCase},
      {identifier: "ID", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "idLength", expected: CaseStyle.CamelCase},
      {identifier: "IdLength", expected: CaseStyle.PascalCase},
      {identifier: "id-length", expected: CaseStyle.KebabCase},
      {identifier: "id_length", expected: CaseStyle.SnakeCase},
      {identifier: "ID_LENGTH", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "moduleId", expected: CaseStyle.CamelCase},
      {identifier: "ModuleId", expected: CaseStyle.PascalCase},
      {identifier: "module-id", expected: CaseStyle.KebabCase},
      {identifier: "module_id", expected: CaseStyle.SnakeCase},
      {identifier: "MODULE_ID", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "ok", expected: CaseStyle.CamelCase},
      {identifier: "Ok", expected: CaseStyle.PascalCase},
      {identifier: "OK", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "okResult", expected: CaseStyle.CamelCase},
      {identifier: "OkResult", expected: CaseStyle.PascalCase},
      {identifier: "ok-result", expected: CaseStyle.KebabCase},
      {identifier: "ok_result", expected: CaseStyle.SnakeCase},
      {identifier: "OK_RESULT", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "returnOk", expected: CaseStyle.CamelCase},
      {identifier: "ReturnOk", expected: CaseStyle.PascalCase},
      {identifier: "return-ok", expected: CaseStyle.KebabCase},
      {identifier: "return_ok", expected: CaseStyle.SnakeCase},
      {identifier: "RETURN_OK", expected: CaseStyle.ScreamingSnakeCase},
      {identifier: "ucs2StringType", expected: CaseStyle.CamelCase},
      {identifier: "Ucs2StringType", expected: CaseStyle.PascalCase},
      {identifier: "ucs2-string-type", expected: CaseStyle.KebabCase},
      {identifier: "ucs2_string_type", expected: CaseStyle.SnakeCase},
      {identifier: "UCS2_STRING_TYPE", expected: CaseStyle.ScreamingSnakeCase},
    ];

    for (const item of items) {
      it(`detectCaseStyle for ${item.identifier} should return ${item.expected}`, function () {
        chaiAssert.deepEqual(detectCaseStyle(item.identifier), item.expected);
      });
    }
  });

  {
    interface Item {
      caseStyle: CaseStyle;
      identifier: string;
      parts: string[];
    }

    const items: Item[] = [
      {identifier: "id", caseStyle: CaseStyle.CamelCase, parts: ["id"]},
      {identifier: "Id", caseStyle: CaseStyle.PascalCase, parts: ["id"]},
      {identifier: "ID", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["id"]},
      {identifier: "idLength", caseStyle: CaseStyle.CamelCase, parts: ["id", "length"]},
      {identifier: "IdLength", caseStyle: CaseStyle.PascalCase, parts: ["id", "length"]},
      {identifier: "id-length", caseStyle: CaseStyle.KebabCase, parts: ["id", "length"]},
      {identifier: "id_length", caseStyle: CaseStyle.SnakeCase, parts: ["id", "length"]},
      {identifier: "ID_LENGTH", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["id", "length"]},
      {identifier: "moduleId", caseStyle: CaseStyle.CamelCase, parts: ["module", "id"]},
      {identifier: "ModuleId", caseStyle: CaseStyle.PascalCase, parts: ["module", "id"]},
      {identifier: "module-id", caseStyle: CaseStyle.KebabCase, parts: ["module", "id"]},
      {identifier: "module_id", caseStyle: CaseStyle.SnakeCase, parts: ["module", "id"]},
      {identifier: "MODULE_ID", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["module", "id"]},
      {identifier: "ok", caseStyle: CaseStyle.CamelCase, parts: ["ok"]},
      {identifier: "Ok", caseStyle: CaseStyle.PascalCase, parts: ["ok"]},
      {identifier: "OK", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["ok"]},
      {identifier: "okResult", caseStyle: CaseStyle.CamelCase, parts: ["ok", "result"]},
      {identifier: "OkResult", caseStyle: CaseStyle.PascalCase, parts: ["ok", "result"]},
      {identifier: "ok-result", caseStyle: CaseStyle.KebabCase, parts: ["ok", "result"]},
      {identifier: "ok_result", caseStyle: CaseStyle.SnakeCase, parts: ["ok", "result"]},
      {identifier: "OK_RESULT", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["ok", "result"]},
      {identifier: "returnOk", caseStyle: CaseStyle.CamelCase, parts: ["return", "ok"]},
      {identifier: "ReturnOk", caseStyle: CaseStyle.PascalCase, parts: ["return", "ok"]},
      {identifier: "return-ok", caseStyle: CaseStyle.KebabCase, parts: ["return", "ok"]},
      {identifier: "return_ok", caseStyle: CaseStyle.SnakeCase, parts: ["return", "ok"]},
      {identifier: "RETURN_OK", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["return", "ok"]},
      {identifier: "ucs2StringType", caseStyle: CaseStyle.CamelCase, parts: ["ucs2", "string", "type"]},
      {identifier: "Ucs2StringType", caseStyle: CaseStyle.PascalCase, parts: ["ucs2", "string", "type"]},
      {identifier: "ucs2-string-type", caseStyle: CaseStyle.KebabCase, parts: ["ucs2", "string", "type"]},
      {identifier: "ucs2_string_type", caseStyle: CaseStyle.SnakeCase, parts: ["ucs2", "string", "type"]},
      {identifier: "UCS2_STRING_TYPE", caseStyle: CaseStyle.ScreamingSnakeCase, parts: ["ucs2", "string", "type"]},
    ];

    describe("split", function () {
      for (const {caseStyle, identifier, parts} of items) {
        it(`split for ${caseStyle}, ${identifier} should return ${JSON.stringify(parts)}`, function () {
          chaiAssert.deepEqual(split(caseStyle, identifier), parts);
        });
      }
    });

    describe("join", function () {
      for (const {caseStyle, identifier, parts} of items) {
        it(`join for ${caseStyle}, ${JSON.stringify(parts)} should return ${identifier}`, function () {
          chaiAssert.deepEqual(join(caseStyle, parts), identifier);
        });
      }
    });
  }

  describe("rename", function () {
    interface Item {
      identifier: string;
      to: CaseStyle;
      expected: string;
    }

    const items: Item[] = [
      {identifier: "Blue", to: CaseStyle.KebabCase, expected: "blue"},
      {identifier: "ucs2StringType", to: CaseStyle.KebabCase, expected: "ucs2-string-type"},
      {identifier: "Ucs2StringType", to: CaseStyle.KebabCase, expected: "ucs2-string-type"},
      {identifier: "ucs2-string-type", to: CaseStyle.KebabCase, expected: "ucs2-string-type"},
      {identifier: "ucs2_string_type", to: CaseStyle.KebabCase, expected: "ucs2-string-type"},
      {identifier: "UCS2_STRING_TYPE", to: CaseStyle.KebabCase, expected: "ucs2-string-type"},
    ];

    for (const {identifier, to, expected} of items) {
      it(`rename ${identifier} to ${to} should return ${expected}`, function () {
        chaiAssert.deepEqual(rename(identifier, to), expected);
      });
    }
  });
});
