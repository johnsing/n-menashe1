// app/library/parashat.ts — all 54 weekly Torah portions
// `ref` is in Sefaria dotted format, e.g. "Genesis.1.1-6.8"

export interface Parasha {
  slug: string;
  name: string;
  hebrew: string;
  ref: string;
  book: "genesis" | "exodus" | "leviticus" | "numbers" | "deuteronomy";
  summary: string;
}

export const PARASHAT: Parasha[] = [
  // ── Bereshit (Genesis) ──
  { slug: "bereshit", name: "Bereshit", hebrew: "בראשית", book: "genesis", ref: "Genesis.1.1-6.8", summary: "Creation, Adam & Eve, Cain and Abel" },
  { slug: "noach", name: "Noach", hebrew: "נח", book: "genesis", ref: "Genesis.6.9-11.32", summary: "The Flood, Noah's covenant, Tower of Babel" },
  { slug: "lech-lecha", name: "Lech-Lecha", hebrew: "לך-לך", book: "genesis", ref: "Genesis.12.1-17.27", summary: "Abraham's call, covenant, circumcision" },
  { slug: "vayera", name: "Vayera", hebrew: "וירא", book: "genesis", ref: "Genesis.18.1-22.24", summary: "Hospitality, Sodom, the binding of Isaac" },
  { slug: "chayei-sara", name: "Chayei Sara", hebrew: "חיי שרה", book: "genesis", ref: "Genesis.23.1-25.18", summary: "Sarah's death, Isaac marries Rebecca" },
  { slug: "toldot", name: "Toldot", hebrew: "תולדות", book: "genesis", ref: "Genesis.25.19-28.9", summary: "Jacob & Esau, the birthright sale" },
  { slug: "vayetzei", name: "Vayetzei", hebrew: "ויצא", book: "genesis", ref: "Genesis.28.10-32.3", summary: "Jacob's ladder, Rachel & Leah, Laban" },
  { slug: "vayishlach", name: "Vayishlach", hebrew: "וישלח", book: "genesis", ref: "Genesis.32.4-36.43", summary: "Wrestling the angel, reunion with Esau" },
  { slug: "vayeshev", name: "Vayeshev", hebrew: "וישב", book: "genesis", ref: "Genesis.37.1-40.23", summary: "Joseph's dreams, sold to Egypt" },
  { slug: "miketz", name: "Miketz", hebrew: "מקץ", book: "genesis", ref: "Genesis.41.1-44.17", summary: "Pharaoh's dreams, Joseph rises to power" },
  { slug: "vayigash", name: "Vayigash", hebrew: "ויגש", book: "genesis", ref: "Genesis.44.18-47.27", summary: "Judah's plea, the family moves to Egypt" },
  { slug: "vayechi", name: "Vayechi", hebrew: "ויחי", book: "genesis", ref: "Genesis.47.28-50.26", summary: "Jacob blesses his sons, deaths of Jacob & Joseph" },
  // ── Shemot (Exodus) ──
  { slug: "shemot", name: "Shemot", hebrew: "שמות", book: "exodus", ref: "Exodus.1.1-6.1", summary: "Slavery, Moses' birth, the burning bush" },
  { slug: "vaera", name: "Vaera", hebrew: "וארא", book: "exodus", ref: "Exodus.6.2-9.35", summary: "The first seven plagues" },
  { slug: "bo", name: "Bo", hebrew: "בא", book: "exodus", ref: "Exodus.10.1-13.16", summary: "The final plagues, Passover, the Exodus" },
  { slug: "beshalach", name: "Beshalach", hebrew: "בשלח", book: "exodus", ref: "Exodus.13.17-17.16", summary: "The sea splits, manna, Amalek" },
  { slug: "yitro", name: "Yitro", hebrew: "יתרו", book: "exodus", ref: "Exodus.18.1-20.23", summary: "Jethro's advice, Sinai, Ten Commandments" },
  { slug: "mishpatim", name: "Mishpatim", hebrew: "משפטים", book: "exodus", ref: "Exodus.21.1-24.18", summary: "Civil laws, 'We will do and we will hear'" },
  { slug: "terumah", name: "Terumah", hebrew: "תרומה", book: "exodus", ref: "Exodus.25.1-27.19", summary: "Offerings for the Tabernacle, the Ark" },
  { slug: "tetzaveh", name: "Tetzaveh", hebrew: "תצוה", book: "exodus", ref: "Exodus.27.20-30.10", summary: "Priestly garments, daily offering" },
  { slug: "ki-tisa", name: "Ki Tisa", hebrew: "כי תשא", book: "exodus", ref: "Exodus.30.11-34.35", summary: "The golden calf, second tablets" },
  { slug: "vayakhel", name: "Vayakhel", hebrew: "ויקהל", book: "exodus", ref: "Exodus.35.1-38.20", summary: "Building the Tabernacle, Shabbat first" },
  { slug: "pekudei", name: "Pekudei", hebrew: "פקודי", book: "exodus", ref: "Exodus.38.21-40.38", summary: "Tabernacle completed, the cloud of glory" },
  // ── Vayikra (Leviticus) ──
  { slug: "vayikra", name: "Vayikra", hebrew: "ויקרא", book: "leviticus", ref: "Leviticus.1.1-5.26", summary: "The sacrificial offerings" },
  { slug: "tzav", name: "Tzav", hebrew: "צו", book: "leviticus", ref: "Leviticus.6.1-8.36", summary: "Priestly duties, consecration of Aaron" },
  { slug: "shemini", name: "Shemini", hebrew: "שמיני", book: "leviticus", ref: "Leviticus.9.1-11.47", summary: "Nadab & Abihu, laws of kosher animals" },
  { slug: "tazria", name: "Tazria", hebrew: "תזריע", book: "leviticus", ref: "Leviticus.12.1-13.59", summary: "Childbirth purity, tzara'at" },
  { slug: "metzora", name: "Metzora", hebrew: "מצורע", book: "leviticus", ref: "Leviticus.14.1-15.33", summary: "Cleansing the metzora, purity laws" },
  { slug: "achrei-mot", name: "Achrei Mot", hebrew: "אחרי מות", book: "leviticus", ref: "Leviticus.16.1-18.30", summary: "Yom Kippur service, holiness code" },
  { slug: "kedoshim", name: "Kedoshim", hebrew: "קדושים", book: "leviticus", ref: "Leviticus.19.1-20.27", summary: "'Love your neighbor as yourself'" },
  { slug: "emor", name: "Emor", hebrew: "אמור", book: "leviticus", ref: "Leviticus.21.1-24.23", summary: "Priestly purity, the festivals" },
  { slug: "behar", name: "Behar", hebrew: "בהר", book: "leviticus", ref: "Leviticus.25.1-26.2", summary: "Sabbatical year, Jubilee, redemption" },
  { slug: "bechukotai", name: "Bechukotai", hebrew: "בחוקותי", book: "leviticus", ref: "Leviticus.26.3-27.34", summary: "Blessings and curses, vows" },
  // ── Bemidbar (Numbers) ──
  { slug: "bemidbar", name: "Bemidbar", hebrew: "במדבר", book: "numbers", ref: "Numbers.1.1-4.20", summary: "The census, camp arrangement, Levites" },
  { slug: "nasso", name: "Nasso", hebrew: "נשא", book: "numbers", ref: "Numbers.4.21-7.89", summary: "Nazirite vow, priestly blessing" },
  { slug: "behaalotcha", name: "Beha'alotcha", hebrew: "בהעלתך", book: "numbers", ref: "Numbers.8.1-12.16", summary: "The menorah, 70 elders, complaints" },
  { slug: "shelach", name: "Shelach", hebrew: "שלח-לך", book: "numbers", ref: "Numbers.13.1-15.41", summary: "The spies, tzitzit" },
  { slug: "korach", name: "Korach", hebrew: "קרח", book: "numbers", ref: "Numbers.16.1-18.32", summary: "Korach's rebellion, the budding staff" },
  { slug: "chukat", name: "Chukat", hebrew: "חקת", book: "numbers", ref: "Numbers.19.1-22.1", summary: "Red heifer, the bronze serpent" },
  { slug: "balak", name: "Balak", hebrew: "בלק", book: "numbers", ref: "Numbers.22.2-25.9", summary: "Balaam, the talking donkey, blessings" },
  { slug: "pinchas", name: "Pinchas", hebrew: "פינחס", book: "numbers", ref: "Numbers.25.10-30.1", summary: "Pinchas rewarded, daughters of Zelophehad" },
  { slug: "matot", name: "Matot", hebrew: "מטות", book: "numbers", ref: "Numbers.30.2-32.42", summary: "Vows, war with Midian, Transjordan tribes" },
  { slug: "masei", name: "Masei", hebrew: "מסעי", book: "numbers", ref: "Numbers.33.1-36.13", summary: "The 42 journeys, cities of refuge" },
  // ── Devarim (Deuteronomy) ──
  { slug: "devarim", name: "Devarim", hebrew: "דברים", book: "deuteronomy", ref: "Deuteronomy.1.1-3.22", summary: "Moses' farewell begins" },
  { slug: "vaetchanan", name: "Va'etchanan", hebrew: "ואתחנן", book: "deuteronomy", ref: "Deuteronomy.3.23-7.11", summary: "Ten Commandments repeated, the Shema" },
  { slug: "eikev", name: "Eikev", hebrew: "עקב", book: "deuteronomy", ref: "Deuteronomy.7.12-11.25", summary: "'If you heed', the second tablets" },
  { slug: "reeh", name: "Re'eh", hebrew: "ראה", book: "deuteronomy", ref: "Deuteronomy.11.26-16.17", summary: "Blessing and curse, festivals" },
  { slug: "shoftim", name: "Shoftim", hebrew: "שופטים", book: "deuteronomy", ref: "Deuteronomy.16.18-21.9", summary: "Judges, kings, false prophets" },
  { slug: "ki-teitzei", name: "Ki Teitzei", hebrew: "כי-תצא", book: "deuteronomy", ref: "Deuteronomy.21.10-25.19", summary: "Civil and family laws, Amalek" },
  { slug: "ki-tavo", name: "Ki Tavo", hebrew: "כי-תבוא", book: "deuteronomy", ref: "Deuteronomy.26.1-29.8", summary: "First fruits, blessings & curses" },
  { slug: "nitzavim", name: "Nitzavim", hebrew: "ניצבים", book: "deuteronomy", ref: "Deuteronomy.29.9-30.20", summary: "Covenant renewal, repentance" },
  { slug: "vayelech", name: "Vayelech", hebrew: "וילך", book: "deuteronomy", ref: "Deuteronomy.31.1-31.30", summary: "'Be strong', writing the Torah" },
  { slug: "haazinu", name: "Ha'azinu", hebrew: "האזינו", book: "deuteronomy", ref: "Deuteronomy.32.1-32.52", summary: "The Song of Moses" },
  { slug: "vezot-haberakhah", name: "Vezot Haberakhah", hebrew: "וזאת הברכה", book: "deuteronomy", ref: "Deuteronomy.33.1-34.12", summary: "Moses blesses the tribes, his death" },
];

export const getParasha = (slug: string) =>
  PARASHAT.find((p) => p.slug === slug);

export const TORAH_BOOKS: { id: Parasha["book"]; label: string }[] = [
  { id: "genesis", label: "Bereshit" },
  { id: "exodus", label: "Shemot" },
  { id: "leviticus", label: "Vayikra" },
  { id: "numbers", label: "Bemidbar" },
  { id: "deuteronomy", label: "Devarim" },
];

export const parashatByBook = (book: Parasha["book"]) =>
  PARASHAT.filter((p) => p.book === book);
