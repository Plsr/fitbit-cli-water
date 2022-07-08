import { createCode } from "./src/util/codeChallange";

// FIXME: Check dynamically later on
const authNeeded = true;

if (authNeeded) {
  const challengeCode = createCode()
  console.log(challengeCode)
}
