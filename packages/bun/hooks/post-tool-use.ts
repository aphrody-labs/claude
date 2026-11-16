#!/usr/bin/env bun
import { readHookInput, writeJson } from "./common.ts";

await readHookInput();
writeJson({});
