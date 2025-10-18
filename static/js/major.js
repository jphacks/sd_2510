var array = new Array();
array[''] = new Array({cd:"0", label:"1つ選択してください"});

array["literature"] = new Array(
    {cd:"1", label:"日本学"},
    {cd:"2", label:"広域文化学"},
    {cd:"3", label:"総合人間学"},
);
array["education"] = [
    {cd:"1", label:"総合教育科学"},
    {cd:"2", label:"教育設計評価"},
];
array["law"] = [
    {cd:"1", label:"総合法制"},
    {cd:"2", label:"公共法政策"},
    {cd:"3", label:"法政理論研究"},
];
array["economics"] = [
    {cd:"1", label:"経済経営学"},
    {cd:"2", label:"会計専門職"},
];
array["science"] = [
    {cd:"1", label:"数学"},
    {cd:"2", label:"物理学"},
    {cd:"3", label:"化学"},
    {cd:"4", label:"地球物理学"},
    {cd:"5", label:"天文学"},
    {cd:"6", label:"海洋科学"},
    {cd:"7", label:"地学"},
];
array["medicine"] = [
    {cd:"1", label:"医学"},
    {cd:"2", label:"障害科学"},
    {cd:"3", label:"保健学"},
    {cd:"4", label:"公衆衛生学"},
];
array["dentistry"] = [
    {cd:"1", label:"歯学"},
];
array["pharmacy"] = [
    {cd:"1", label:"分子薬科学"},
    {cd:"2", label:"生命薬科学"},
    {cd:"3", label:"医療薬学"},
];
array["engineering"] = [
    {cd:"1", label:"機械機能創成"},
    {cd:"2", label:"ファインメカニクス"},
    {cd:"3", label:"ロボティクス"},
    {cd:"4", label:"航空宇宙工学"},
    {cd:"5", label:"量子エネルギー工学"},
    {cd:"6", label:"電気エネルギーシステム"},
    {cd:"7", label:"通信工学"},
    {cd:"8", label:"電子工学"},
    {cd:"9", label:"応用物理工学"},
    {cd:"10", label:"応用工学"},
    {cd:"11", label:"化学工学"},
    {cd:"12", label:"バイオ工学"},
    {cd:"13", label:"金属フロンティア工学"},
    {cd:"14", label:"知能デバイス材料学"},
    {cd:"15", label:"土木工学"},
    {cd:"16", label:"都市・建築学"},
    {cd:"17", label:"技術社会工学"},
];
array["agriculture"] = [
    {cd:"1", label:"生物生産科学"},
    {cd:"2", label:"農芸化学"},
];
array["international_culture"] = [
    {cd:"1", label:"国際文化研究"},
];
array["information_science"] = [
    {cd:"1", label:"情報基礎科学"},
    {cd:"2", label:"システム情報科学"},
    {cd:"3", label:"人間社会情報科学"},
    {cd:"4", label:"応用情報科学"},
];
array["life_science"] = [
    {cd:"1", label:"脳生命統制科学"},
    {cd:"2", label:"生態発生適応科学"},
    {cd:"3", label:"分子化学生物学"},
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
