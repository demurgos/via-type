"use strict";

const buildTools = require("demurgos-web-build-tools");
const gulp = require("gulp");
const typescript = require("typescript");

// Project-wide options
const projectOptions = Object.assign(
  {},
  buildTools.config.DEFAULT_PROJECT_OPTIONS,
  {
    root: __dirname
  }
);

// `lib-cjs` target
const libCjsTarget = Object.assign(
  {},
  buildTools.config.LIB_TARGET,
  {
    name: "lib-cjs",
    scripts: ["lib/**/*.ts", "!lib/**/*.es5.ts"],
    typeRoots: ["custom-typings", "../node_modules/@types"],
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es2015",
        lib: ["es2015"]
      },
      typescript: typescript,
      tsconfigJson: ["lib/tsconfig.json"]
    }
  }
);

// `lib-es` target
const libEsTarget = Object.assign(
  {},
  buildTools.config.LIB_TARGET,
  {
    name: "lib-es",
    scripts: ["lib/**/*.ts", "!lib/**/*.es5.ts"],
    typeRoots: ["custom-typings", "../node_modules/@types"],
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        module: "es2015",
        target: "es2015",
        lib: ["es2015"]
      },
      typescript: typescript,
      tsconfigJson: ["lib/tsconfig.json"]
    }
  }
);

// `lib-test` target
const libTestTarget = Object.assign(
  {},
  buildTools.config.LIB_TEST_TARGET,
  {
    name: "lib-test",
    scripts: ["test/**/*.ts", "lib/**/*.ts", "!lib/**/*.es5.ts"],
    typeRoots: ["custom-typings", "../node_modules/@types"],
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es2015",
        lib: ["es2015"]
      },
      typescript: typescript,
      tsconfigJson: ["test/tsconfig.json"]
    },
    copy: [
      {
        name: "test-resources",
        files: ["test/test-resources/**/*"]
      }
    ]
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libCjsTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libEsTarget);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);

gulp.task("all:tsconfig.json", gulp.parallel("lib-es:tsconfig.json", "lib-test:tsconfig.json"));
gulp.task("all:build", gulp.parallel("lib-cjs:build", "lib-es:build"));
gulp.task("all:dist", gulp.parallel("lib-cjs:dist", "lib-es:dist"));
