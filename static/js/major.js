var array = new Array();
array[''] = new Array({cd:"0", label:"1つ選択してください"});

array["literature"] = new Array(
    {cd:"日本学", label:"日本学"},
    {cd:"広域文化学", label:"広域文化学"},
    {cd:"総合人間学", label:"総合人間学"},
);
array["education"] = [
    {cd:"総合教育科学", label:"総合教育科学"},
    {cd:"教育設計評価", label:"教育設計評価"},
];
array["law"] = [
    {cd:"総合法制", label:"総合法制"},
    {cd:"公共法政策", label:"公共法政策"},
    {cd:"法政理論研究", label:"法政理論研究"},
];
array["economics"] = [
    {cd:"経済経営学", label:"経済経営学"},
    {cd:"会計専門職", label:"会計専門職"},
];
array["science"] = [
    {cd:"数学", label:"数学"},
    {cd:"物理学", label:"物理学"},
    {cd:"化学", label:"化学"},
    {cd:"地球物理学", label:"地球物理学"},
    {cd:"天文学", label:"天文学"},
    {cd:"海洋科学", label:"海洋科学"},
    {cd:"地学", label:"地学"},
];
array["medicine"] = [
    {cd:"医学", label:"医学"},
    {cd:"障害科学", label:"障害科学"},
    {cd:"保健学", label:"保健学"},
    {cd:"公衆衛生学", label:"公衆衛生学"},
];
array["dentistry"] = [
    {cd:"歯学", label:"歯学"},
];
array["pharmacy"] = [
    {cd:"分子薬科学", label:"分子薬科学"},
    {cd:"生命薬科学", label:"生命薬科学"},
    {cd:"医療薬学", label:"医療薬学"},
];
array["engineering"] = [
    {cd:"機械機能創成", label:"機械機能創成"},
    {cd:"ファインメカニクス", label:"ファインメカニクス"},
    {cd:"ロボティクス", label:"ロボティクス"},
    {cd:"航空宇宙工学", label:"航空宇宙工学"},
    {cd:"量子エネルギー工学", label:"量子エネルギー工学"},
    {cd:"電気エネルギーシステム", label:"電気エネルギーシステム"},
    {cd:"通信工学", label:"通信工学"},
    {cd:"電子工学", label:"電子工学"},
    {cd:"応用物理工学", label:"応用物理工学"},
    {cd:"応用工学", label:"応用工学"},
    {cd:"化学工学", label:"化学工学"},
    {cd:"バイオ工学", label:"バイオ工学"},
    {cd:"金属フロンティア工学", label:"金属フロンティア工学"},
    {cd:"知能デバイス材料学", label:"知能デバイス材料学"},
    {cd:"土木工学", label:"土木工学"},
    {cd:"都市・建築学", label:"都市・建築学"},
    {cd:"技術社会工学", label:"技術社会工学"},
];
array["agriculture"] = [
    {cd:"生物生産科学", label:"生物生産科学"},
    {cd:"農芸化学", label:"農芸化学"},
];
array["international_culture"] = [
    {cd:"国際文化研究", label:"国際文化研究"},
];
array["information_science"] = [
    {cd:"情報基礎科学", label:"情報基礎科学"},
    {cd:"システム情報科学", label:"システム情報科学"},
    {cd:"人間社会情報科学", label:"人間社会情報科学"},
    {cd:"応用情報科学", label:"応用情報科学"},
];
array["life_science"] = [
    {cd:"脳生命統制科学", label:"脳生命統制科学"},
    {cd:"生態発生適応科学", label:"生態発生適応科学"},
    {cd:"分子化学生物学", label:"分子化学生物学"},
];

document.getElementById('department').onchange = function(){
  major = document.getElementById("major");
  major.options.length = 0
  var changedDepartment = department.value;
  for (let i = 0; i < array[changedDepartment].length; i++) {
    var op = document.createElement("option");
    value = array[changedDepartment][i]
    op.value = value.cd;
    op.text = value.label;
    major.appendChild(op);
  }
}
