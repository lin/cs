The first 128 chars are ASCII or Control Chars and Basic Latin, which is the most important part of the Unicode.

Among the first 128, the first 32 are control chars, notably:

`10, 0x000A` is New Line (NL) `\n`

`13, 0x000D` is Carriage Return (CR) `\r`

Among the first 128, the next 96 are basic latin, notably:

`32, 0x0020` is space, ` `. One of the most important charcodes.

`48, 0x0030` is 0, between space and zero are: `!"#$%&'()*+,-./`

`65, 0x0041` is A, before A are: `:;<=>?@`

`97, 0x0061` is a, after Z and before a are: `[\]^_\``, the diff between captital and lowercase letter are 32 or 0x20

after lowercases are `{|}~`

---

Then it comes with (includes above 128) Basic Multilingual Plane (BMP), which ends at 0xFFFF, which is 65536 chars total. 

![BMP Details](https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Roadmap_to_Unicode_BMP_de.svg/1000px-Roadmap_to_Unicode_BMP_de.svg.png)

1. It includes lots of languages (like CJK and IPA) and extended chars.
2. `0xD800 - 0xDFFF` is for surrogate pairs used in UTF-16
3. `0x0300 - 0x036F` is for Combining Diacritical Marks
4. `0xE000 — 0xF8FF` is for Private Use (Area).

