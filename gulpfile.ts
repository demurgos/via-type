import * as buildTools from "demurgos-web-build-tools";
import * as gulp from "gulp";
import * as typescript from "typescript";

// Project-wide options
const project: buildTools.Project = {
  ...buildTools.DEFAULT_PROJECT,
  root: __dirname,
};

// `lib` target (commonJs)
const libTarget: buildTools.NodeTarget = {
  ...buildTools.LIB_TARGET,
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["tsconfig.json"],
  },
  distPackage: true,
};

// `lib-test` target
const libTestTarget: buildTools.TestTarget = {
  ...buildTools.LIB_TEST_TARGET,
  name: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["test/tsconfig.json"],
  },
};

buildTools.projectTasks.registerAll(gulp, project);
buildTools.targetGenerators.node.generateTarget(gulp, project, libTarget);
buildTools.targetGenerators.test.generateTarget(gulp, project, libTestTarget);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json"));
gulp.task("all:dist", gulp.parallel("lib:dist"));
