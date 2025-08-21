#!/usr/bin/env node
import { execSync } from "child_process";
import chalk from "chalk";

function runCheck(command, label) {
  try {
    console.log(chalk.blueBright(`\n🔍 Checking ${label}...`));
    execSync(command, { stdio: "inherit" });
    console.log(chalk.greenBright(`✅ ${label} passed!\n`));
  } catch (error) {
    console.error(
      chalk.bgRed.white.bold(`\n❌ ${label} failed! Fix the errors above ⬆️\n`)
    );
    process.exit(1); // block commit
  }
}

runCheck("tsc --noEmit", "TypeScript");
runCheck("next lint", "ESLint");
