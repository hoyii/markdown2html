// 工具函数
// 这个文件包含了一些常用的工具函数，用于字符串处理、HTML转义、数组操作等。

import * as mdurl from "mdurl";
import * as ucmicro from "uc.micro";
import { decodeHTML } from "entities";

function _class(obj: any): string {
  return Object.prototype.toString.call(obj);
}

function isString(obj: any): obj is string {
  return _class(obj) === "[object String]";
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object: Record<string, any>, key: string): boolean {
  return _hasOwnProperty.call(object, key);
}

// Merge objects
function assign(obj: any, ...sources: any[]): any {
  sources.forEach((source) => {
    if (typeof source !== "object" || source === null) {
      throw new TypeError(source + " must be an object");
    }
  });
  return Object.assign(obj, ...sources);
}

function arrayReplaceAt<T>(src: T[], pos: number, newElements: T[]): T[] {
  return [...src.slice(0, pos), ...newElements, ...src.slice(pos + 1)];
}

function isValidEntityCode(c: number): boolean {
  if (c >= 0xd800 && c <= 0xdfff) {
    return false;
  }
  if (c >= 0xfdd0 && c <= 0xfdef) {
    return false;
  }
  if ((c & 0xffff) === 0xffff || (c & 0xffff) === 0xfffe) {
    return false;
  }
  if (c >= 0x00 && c <= 0x08) {
    return false;
  }
  if (c === 0x0b) {
    return false;
  }
  if (c >= 0x0e && c <= 0x1f) {
    return false;
  }
  if (c >= 0x7f && c <= 0x9f) {
    return false;
  }
  if (c > 0x10ffff) {
    return false;
  }
  return true;
}

function fromCodePoint(c: number): string {
  if (c > 0xffff) {
    c -= 0x10000;
    const surrogate1 = 0xd800 + (c >> 10);
    const surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}

const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
const UNESCAPE_ALL_RE = new RegExp(
  UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source,
  "gi"
);

const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;

function replaceEntityPattern(match: string, name: string): string {
  if (
    name.charCodeAt(0) === 0x23 /* # */ &&
    DIGITAL_ENTITY_TEST_RE.test(name)
  ) {
    const code =
      name[1].toLowerCase() === "x"
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);

    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }

    return match;
  }

  const decoded = decodeHTML(match);
  if (decoded !== match) {
    return decoded;
  }

  return match;
}

function unescapeMd(str: string): string {
  if (str.indexOf("\\") < 0) {
    return str;
  }
  return str.replace(UNESCAPE_MD_RE, "$1");
}

function unescapeAll(str: string): string {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
    return str;
  }

  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
    if (escaped) {
      return escaped;
    }
    return replaceEntityPattern(match, entity);
  });
}

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function replaceUnsafeChar(ch: string): string {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str: string): string {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE(str: string): string {
  return str.replace(REGEXP_ESCAPE_RE, "\\$&");
}

function isSpace(code: number): boolean {
  return code === 0x09 || code === 0x20;
}

function isWhiteSpace(code: number): boolean {
  if (code >= 0x2000 && code <= 0x200a) {
    return true;
  }
  switch (code) {
    case 0x09: // \t
    case 0x0a: // \n
    case 0x0b: // \v
    case 0x0c: // \f
    case 0x0d: // \r
    case 0x20:
    case 0xa0:
    case 0x1680:
    case 0x202f:
    case 0x205f:
    case 0x3000:
      return true;
    default:
      return false;
  }
}

function isPunctChar(ch: string): boolean {
  return ucmicro.P.test(ch) || ucmicro.S.test(ch);
}

function isMdAsciiPunct(ch: number): boolean {
  switch (ch) {
    case 0x21 /* ! */:
    case 0x22 /* " */:
    case 0x23 /* # */:
    case 0x24 /* $ */:
    case 0x25 /* % */:
    case 0x26 /* & */:
    case 0x27 /* ' */:
    case 0x28 /* ( */:
    case 0x29 /* ) */:
    case 0x2a /* * */:
    case 0x2b /* + */:
    case 0x2c /* , */:
    case 0x2d /* - */:
    case 0x2e /* . */:
    case 0x2f /* / */:
    case 0x3a /* : */:
    case 0x3b /* ; */:
    case 0x3c /* < */:
    case 0x3d /* = */:
    case 0x3e /* > */:
    case 0x3f /* ? */:
    case 0x40 /* @ */:
    case 0x5b /* [ */:
    case 0x5c /* \ */:
    case 0x5d /* ] */:
    case 0x5e /* ^ */:
    case 0x5f /* _ */:
    case 0x60 /* ` */:
    case 0x7b /* { */:
    case 0x7c /* | */:
    case 0x7d /* } */:
    case 0x7e /* ~ */:
      return true;
    default:
      return false;
  }
}

function normalizeReference(str: string): string {
  str = str.trim().replace(/\s+/g, " ");

  if ("ẞ".toLowerCase() === "Ṿ") {
    str = str.replace(/ẞ/g, "ß");
  }

  return str.toLowerCase().toUpperCase();
}

const lib = { mdurl, ucmicro };

export {
  lib,
  assign,
  isString,
  has,
  unescapeMd,
  unescapeAll,
  isValidEntityCode,
  fromCodePoint,
  escapeHtml,
  arrayReplaceAt,
  isSpace,
  isWhiteSpace,
  isMdAsciiPunct,
  isPunctChar,
  escapeRE,
  normalizeReference,
};
