import * as buildTools from "demurgos-web-build-tools";
import * as gulp from "gulp";
import * as typescript from "typescript";

// Project-wide options
const project: buildTools.Project = {
  ...buildTools.DEFAULT_PROJECT,
  root: __dirname,
};

const libProject: buildTools.Project = {...project, srcDir: "src/lib"};

// `lib` target (commonJs)
const libTarget: buildTools.NodeTarget = {
  ...buildTools.LIB_TARGET,
  name: "lib",
  scripts: ["**/*.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["tsconfig.json"],
  },
};

// `lib-es` target
const libEsTarget: buildTools.NodeTarget = {
  ...buildTools.LIB_TARGET,
  name: "lib-es",
  scripts: ["**/*.ts"],
  targetDir: "lib-es",
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
      module: "es2015",
    },
    typescript: typescript,
    tsconfigJson: ["es.tsconfig.json"],
  },
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
buildTools.targetGenerators.node.generateTarget(gulp, libProject, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, libProject, libEsTarget);
buildTools.targetGenerators.test.generateTarget(gulp, project, libTestTarget);

gulp.task(
  "all:tsconfig.json",
  gulp.parallel("lib:tsconfig.json", "lib-es:tsconfig.json", "test:tsconfig.json")
);
gulp.task("all:build", gulp.parallel("lib:build", "lib-es:build"));
gulp.task("all:dist", gulp.parallel("lib:dist", "lib-es:dist"));
