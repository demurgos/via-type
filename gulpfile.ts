import * as buildTools from "demurgos-web-build-tools";
import * as gulp from "gulp";
import * as typescript from "typescript";

// Project-wide options
const project: buildTools.Project = {
  ...buildTools.DEFAULT_PROJECT,
  root: __dirname,
};

// `lib-cjs` target
const libCjsTarget: buildTools.NodeTarget = {
  ...buildTools.LIB_TARGET,
  name: "lib-cjs",
  scripts: ["lib/**/*.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["lib/tsconfig.json"],
  },
};

// `lib-es` target
const libEsTarget: buildTools.NodeTarget = Object.assign(
  {},
  buildTools.LIB_TARGET,
  {
    name: "lib-es",
    scripts: ["lib/**/*.ts", "!lib/**/*.es5.ts"],
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        module: "es2015",
      },
      typescript: typescript,
      tsconfigJson: ["lib/es.tsconfig.json"],
    },
  },
);

// `lib-test` target
const libTestTarget: buildTools.TestTarget = {
  ...buildTools.LIB_TEST_TARGET,
  name: "lib-test",
  scripts: ["test/**/*.ts", "lib/**/*.ts", "!lib/**/*.es5.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["test/tsconfig.json"],
  },
};

buildTools.projectTasks.registerAll(gulp, project);
buildTools.targetGenerators.node.generateTarget(gulp, project, libCjsTarget);
buildTools.targetGenerators.node.generateTarget(gulp, project, libEsTarget);
buildTools.targetGenerators.test.generateTarget(gulp, project, libTestTarget);

gulp.task(
  "all:tsconfig.json",
  gulp.parallel("lib-cjs:tsconfig.json", "lib-es:tsconfig.json", "lib-test:tsconfig.json")
);
gulp.task("all:build", gulp.parallel("lib-cjs:build", "lib-es:build"));
gulp.task("all:dist", gulp.parallel("lib-cjs:dist", "lib-es:dist"));
