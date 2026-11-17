const fs = require("fs");
const script = fs.readFileSync("inject_template.txt", "utf8");
fs.writeFileSync("run_inject.py", script, "utf8");
console.log("run_inject.py created");