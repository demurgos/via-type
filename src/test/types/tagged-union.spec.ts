import {CaseStyle} from "../../lib/_helpers/rename";
import {DocumentType} from "../../lib/document";
import {IntegerType} from "../../lib/integer";
import {LiteralType} from "../../lib/literal";
import {SimpleEnumType} from "../../lib/simple-enum";
import {TaggedUnionType} from "../../lib/tagged-union";
import {runTests, TypedValue} from "../helpers/test";

describe("TaggedUnion", function () {
  describe("TaggedUnion<Shape>", function () {
    enum ShapeType {
      Rectangle,
      Circle,
    }
    const shapeTypeType: SimpleEnumType<ShapeType> = new SimpleEnumType({
      enum: ShapeType,
      rename: CaseStyle.KebabCase,
    });

    interface Rectangle {
      type: ShapeType.Rectangle;
      width: number;
      height: number;
    }
    const rectangleType: DocumentType<Rectangle> = new DocumentType<Rectangle>({
      properties: {
        type: {
          type: new LiteralType<ShapeType.Rectangle>({
            type: shapeTypeType,
            value: ShapeType.Rectangle,
          }),
        },
        width: {type: new IntegerType()},
        height: {type: new IntegerType()},
      },
      rename: CaseStyle.KebabCase,
    });

    interface Circle {
      type: ShapeType.Circle;
      radius: number;
    }
    const circleType: DocumentType<Circle> = new DocumentType<Circle>({
      properties: {
        type: {
          type: new LiteralType<ShapeType.Circle>({
            type: shapeTypeType,
            value: ShapeType.Circle,
          }),
        },
        radius: {type: new IntegerType()},
      },
      rename: CaseStyle.KebabCase,
    });

    type Shape = Rectangle | Circle;
    const shapeType: TaggedUnionType<Shape> = new TaggedUnionType<Shape>({
      variants: [rectangleType, circleType],
      tag: "type",
    });

    const items: TypedValue[] = [
      {
        name: "Rectangle {type: ShapeType.Rectangle, width: 10, height: 20}",
        value: <Rectangle> {
          type: ShapeType.Rectangle,
          width: 10,
          height: 20,
        },
        valid: true,
        output: {
          bson: {
            type: "rectangle",
            width: 10,
            height: 20,
          },
          json: {
            type: "rectangle",
            width: 10,
            height: 20,
          },
          qs: {
            type: "rectangle",
            width: "10",
            height: "20",
          },
        },
      },
      {
        name: "Circle {type: ShapeType.Circle, radius: 15}",
        value: <Circle> {
          type: ShapeType.Circle,
          radius: 15,
        },
        valid: true,
        output: {
          bson: {
            type: "circle",
            radius: 15,
          },
          json: {
            type: "circle",
            radius: 15,
          },
          qs: {
            type: "circle",
            radius: "15",
          },
        },
      },

      {
        name: "{type: ShapeType.Circle}",
        value: {
          type: ShapeType.Circle,
        },
        valid: false,
      },
      {
        name: "{radius: 15}",
        value: {
          radius: 15,
        },
        valid: false,
      },
      {
        name: "{type: ShapeType.Circle, radius: true}",
        value: {
          type: ShapeType.Circle,
          radius: true,
        },
        valid: false,
      },
      {name: '"foo"', value: "bar", valid: false},
      {name: "0", value: 0, valid: false},
      {name: "1", value: 1, valid: false},
      {name: '""', value: "", valid: false},
      {name: '"0"', value: "0", valid: false},
      {name: "true", value: true, valid: false},
      {name: "false", value: false, valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {name: 'new Date("1247-05-18T19:40:08.418Z")', value: new Date("1247-05-18T19:40:08.418Z"), valid: false},
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests(shapeType, items);
  });
});
