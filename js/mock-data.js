/* ============================================
   食刻NOW — 模拟菜谱数据 (15道)
   emoji = 成品菜展示图 | step.emoji = 单步骤图标
   ============================================ */

const MOCK_RECIPES = [
  {
    id: 1, name: '番茄炒蛋',
    emoji: '🍽️', heroColor: '#FFE4D0',
    time: '15分钟', difficulty: '简单', diffLevel: 0, calories: '约180千卡',
    taste: ['粤菜'], method: '炒',
    ingredients: ['番茄 2个', '鸡蛋 3个', '葱', '盐', '糖', '食用油'],
    steps: [
      { text: '番茄洗净切块，鸡蛋打散加少许盐搅匀。', emoji: '🔪' },
      { text: '热锅倒油，油温七成热时倒入蛋液，快速划散，凝固后盛出。', emoji: '🍳' },
      { text: '锅中底油烧热，放入番茄块翻炒至出汁，加一小勺糖提鲜。', emoji: '🔥' },
      { text: '倒回炒好的鸡蛋翻炒均匀，加盐调味，撒上葱花出锅。', emoji: '✨' }
    ],
    protein: '14g', carbs: '8g', fat: '10g', tags: ['快手菜', '下饭']
  },
  {
    id: 2, name: '蒜蓉西兰花',
    emoji: '🥗', heroColor: '#E8F5E1',
    time: '10分钟', difficulty: '简单', diffLevel: 0, calories: '约85千卡',
    taste: ['粤菜'], method: '炒',
    ingredients: ['西兰花 1颗', '大蒜 4瓣', '盐', '蚝油', '食用油'],
    steps: [
      { text: '西兰花掰成小朵，盐水浸泡10分钟后洗净沥干。', emoji: '💧' },
      { text: '锅中水烧开，加少许盐和油，西兰花焯水1分钟捞出。', emoji: '🥘' },
      { text: '大蒜切末，热锅凉油下蒜末爆香。', emoji: '🧄' },
      { text: '倒入西兰花大火快炒，加蚝油和盐调味，翻炒均匀即可。', emoji: '🔥' }
    ],
    protein: '5g', carbs: '7g', fat: '3g', tags: ['低卡', '减脂']
  },
  {
    id: 3, name: '红烧肉',
    emoji: '🍖', heroColor: '#F5E1D0',
    time: '60分钟', difficulty: '中等', diffLevel: 1, calories: '约420千卡',
    taste: ['川菜', '国菜'], method: '煮',
    ingredients: ['五花肉 500g', '冰糖', '生抽', '老抽', '料酒', '姜', '八角', '桂皮'],
    steps: [
      { text: '五花肉切3cm方块，冷水下锅加姜片料酒焯水，捞出洗净。', emoji: '🔪' },
      { text: '锅中少油，小火炒冰糖至融化变成琥珀色。', emoji: '🍬' },
      { text: '下五花肉翻炒上色，加生抽老抽料酒炒匀。', emoji: '🍳' },
      { text: '加入开水没过肉，放八角桂皮，大火烧开转小火炖50分钟，收汁出锅。', emoji: '🍲' }
    ],
    protein: '18g', carbs: '12g', fat: '32g', tags: ['硬菜', '下饭']
  },
  {
    id: 4, name: '酸辣土豆丝',
    emoji: '🥘', heroColor: '#FFF5E1',
    time: '12分钟', difficulty: '简单', diffLevel: 0, calories: '约140千卡',
    taste: ['川菜'], method: '炒',
    ingredients: ['土豆 2个', '干辣椒', '花椒', '醋', '盐', '葱', '食用油'],
    steps: [
      { text: '土豆去皮切细丝，清水浸泡去除淀粉，换水至水清。', emoji: '💧' },
      { text: '干辣椒剪段，葱切葱花。热锅倒油，小火炸香花椒后捞出。', emoji: '🌶️' },
      { text: '转大火，下干辣椒和土豆丝快速翻炒2分钟。', emoji: '🔥' },
      { text: '沿锅边淋入醋，加盐调味，翻炒均匀，撒葱花出锅。', emoji: '✨' }
    ],
    protein: '3g', carbs: '22g', fat: '5g', tags: ['下饭', '素食']
  },
  {
    id: 5, name: '日式照烧鸡腿',
    emoji: '🍗', heroColor: '#FDE8D0',
    time: '25分钟', difficulty: '中等', diffLevel: 1, calories: '约280千卡',
    taste: ['日式'], method: '煎',
    ingredients: ['鸡腿 2个', '酱油', '味醂', '料酒', '蜂蜜', '姜', '白芝麻'],
    steps: [
      { text: '鸡腿去骨，用刀尖在肉厚处划几刀，方便入味。', emoji: '🔪' },
      { text: '酱油+味醂+料酒+蜂蜜+姜片调成照烧汁，鸡腿腌制15分钟。', emoji: '🥣' },
      { text: '平底锅少油，鸡皮朝下中火煎至金黄，翻面再煎3分钟。', emoji: '🍳' },
      { text: '倒入剩余照烧汁，小火收汁至浓稠，切片装盘撒白芝麻。', emoji: '✨' }
    ],
    protein: '24g', carbs: '10g', fat: '14g', tags: ['日料', '高蛋白']
  },
  {
    id: 6, name: '清蒸鲈鱼',
    emoji: '🐟', heroColor: '#E8F0F8',
    time: '25分钟', difficulty: '中等', diffLevel: 1, calories: '约160千卡',
    taste: ['粤菜'], method: '蒸',
    ingredients: ['鲈鱼 1条', '葱', '姜', '蒸鱼豉油', '料酒', '红椒丝'],
    steps: [
      { text: '鲈鱼清理干净，两面各划三刀，抹料酒和姜片腌制10分钟。', emoji: '🔪' },
      { text: '盘中铺葱段姜片垫底，放上鱼，鱼身上再铺姜丝。', emoji: '🐟' },
      { text: '水开后上锅大火蒸8-10分钟，关火焖2分钟。', emoji: '♨️' },
      { text: '倒掉盘中腥水，铺新鲜葱丝红椒丝，淋蒸鱼豉油和热油。', emoji: '🫗' }
    ],
    protein: '28g', carbs: '2g', fat: '5g', tags: ['低脂', '高蛋白']
  },
  {
    id: 7, name: '天妇罗炸虾',
    emoji: '🍤', heroColor: '#FFF0D0',
    time: '30分钟', difficulty: '困难', diffLevel: 2, calories: '约310千卡',
    taste: ['日式'], method: '炸',
    ingredients: ['大虾 8只', '低筋面粉', '冰水', '鸡蛋', '淀粉', '炸油', '萝卜泥'],
    steps: [
      { text: '大虾去壳留尾，挑虾线，腹部划3刀防卷曲，裹薄淀粉。', emoji: '🔪' },
      { text: '冰水+蛋黄+低筋面粉轻轻搅拌（有颗粒感即可，别过度）。', emoji: '🥣' },
      { text: '油温170°C，虾裹面糊入锅炸2分钟至金黄酥脆捞出。', emoji: '🫕' },
      { text: '搭配萝卜泥和天妇罗蘸汁上桌，趁热吃！', emoji: '✨' }
    ],
    protein: '16g', carbs: '22g', fat: '18g', tags: ['日料', '宴客']
  },
  {
    id: 8, name: '麻婆豆腐',
    emoji: '🍲', heroColor: '#FFE8E0',
    time: '20分钟', difficulty: '简单', diffLevel: 0, calories: '约200千卡',
    taste: ['川菜'], method: '煮',
    ingredients: ['嫩豆腐 1盒', '猪肉末 100g', '豆瓣酱', '花椒粉', '辣椒面', '葱', '姜', '蒜', '淀粉'],
    steps: [
      { text: '豆腐切2cm方块，淡盐水中焯2分钟捞出沥干。', emoji: '🔪' },
      { text: '热锅少油，下肉末炒至变色，加豆瓣酱炒出红油。', emoji: '🍳' },
      { text: '加姜蒜末辣椒面炒香，加适量水烧开，轻轻放入豆腐。', emoji: '🥘' },
      { text: '小火煮5分钟入味，水淀粉分两次勾芡，撒花椒粉葱花。', emoji: '✨' }
    ],
    protein: '16g', carbs: '8g', fat: '12g', tags: ['下饭', '川味']
  },
  {
    id: 9, name: '蛋炒饭',
    emoji: '🍛', heroColor: '#FFF8E8',
    time: '10分钟', difficulty: '简单', diffLevel: 0, calories: '约350千卡',
    taste: ['粤菜', '国菜'], method: '炒',
    ingredients: ['隔夜米饭 1碗', '鸡蛋 2个', '胡萝卜', '青豆', '火腿', '葱', '盐', '食用油'],
    steps: [
      { text: '胡萝卜火腿切小丁，青豆解冻，鸡蛋打散加盐。', emoji: '🔪' },
      { text: '热锅多油，倒入蛋液快速炒散成蛋碎，盛出备用。', emoji: '🍳' },
      { text: '锅中底油，下胡萝卜丁青豆火腿丁炒香。', emoji: '🔥' },
      { text: '倒入米饭大火翻炒，加蛋碎和盐炒匀，撒葱花出锅。', emoji: '✨' }
    ],
    protein: '12g', carbs: '45g', fat: '14g', tags: ['快手菜', '主食']
  },
  {
    id: 10, name: '糖醋里脊',
    emoji: '🥡', heroColor: '#FFE0C0',
    time: '25分钟', difficulty: '中等', diffLevel: 1, calories: '约320千卡',
    taste: ['粤菜', '国菜'], method: '炸',
    ingredients: ['猪里脊 300g', '鸡蛋 1个', '淀粉', '番茄酱', '白糖', '白醋', '生抽', '白芝麻'],
    steps: [
      { text: '里脊肉切条，加盐料酒腌制10分钟，打入鸡蛋抓匀。', emoji: '🔪' },
      { text: '每根肉条裹上干淀粉，油温160°C炸至金黄捞出。', emoji: '🫕' },
      { text: '番茄酱+白糖+白醋+生抽+水调成糖醋汁。', emoji: '🥣' },
      { text: '锅中少油，倒入糖醋汁煮至浓稠，下肉条翻炒均匀，撒白芝麻。', emoji: '✨' }
    ],
    protein: '22g', carbs: '18g', fat: '16g', tags: ['经典', '下饭']
  },
  {
    id: 11, name: '凉拌黄瓜',
    emoji: '🥗', heroColor: '#E8F5E8',
    time: '8分钟', difficulty: '简单', diffLevel: 0, calories: '约60千卡',
    taste: ['川菜'], method: '炒',
    ingredients: ['黄瓜 2根', '大蒜', '醋', '生抽', '辣椒油', '芝麻油', '盐', '糖', '香菜'],
    steps: [
      { text: '黄瓜洗净，用刀面拍碎后切段，更好入味。', emoji: '🔪' },
      { text: '大蒜切末，香菜切碎备用。', emoji: '🧄' },
      { text: '碗中调汁：蒜末+醋+生抽+辣椒油+芝麻油+盐+糖拌匀。', emoji: '🥣' },
      { text: '汁倒入黄瓜中翻拌均匀，撒香菜，冷藏10分钟更爽脆。', emoji: '✨' }
    ],
    protein: '2g', carbs: '6g', fat: '3g', tags: ['凉菜', '减脂']
  },
  {
    id: 12, name: '可乐鸡翅',
    emoji: '🍗', heroColor: '#F5D8C0',
    time: '30分钟', difficulty: '中等', diffLevel: 1, calories: '约350千卡',
    taste: ['粤菜', '国菜'], method: '煮',
    ingredients: ['鸡翅中 8个', '可乐 1罐', '姜', '料酒', '生抽', '老抽', '盐', '白芝麻'],
    steps: [
      { text: '鸡翅洗净，两面各划两刀，冷水下锅加姜片料酒焯水去腥。', emoji: '🔪' },
      { text: '捞出洗净沥干，热锅少油，鸡翅煎至两面金黄。', emoji: '🍳' },
      { text: '倒入可乐没过鸡翅，加生抽老抽上色，大火烧开。', emoji: '🥤' },
      { text: '转中小火炖15分钟，大火收汁至浓稠，装盘撒白芝麻。', emoji: '✨' }
    ],
    protein: '22g', carbs: '18g', fat: '20g', tags: ['新手友好', '聚会']
  },
  {
    id: 13, name: '地三鲜',
    emoji: '🥘', heroColor: '#F0E0D0',
    time: '20分钟', difficulty: '中等', diffLevel: 1, calories: '约220千卡',
    taste: ['国菜'], method: '炒',
    ingredients: ['茄子 1个', '土豆 1个', '青椒 1个', '大蒜', '生抽', '老抽', '盐', '糖', '淀粉'],
    steps: [
      { text: '茄子土豆青椒分别切滚刀块，土豆泡水去淀粉沥干。', emoji: '🔪' },
      { text: '多油分别炸土豆至金黄、炸茄子至软，青椒过油捞出。', emoji: '🫕' },
      { text: '调碗汁：生抽+老抽+盐+糖+淀粉+水拌匀。', emoji: '🥣' },
      { text: '锅留底油爆香蒜末，倒回三样蔬菜，淋碗汁大火翻炒均匀。', emoji: '🔥' }
    ],
    protein: '4g', carbs: '28g', fat: '12g', tags: ['东北菜', '下饭']
  },
  {
    id: 14, name: '味噌汤',
    emoji: '🍜', heroColor: '#F5EDE0',
    time: '15分钟', difficulty: '简单', diffLevel: 0, calories: '约90千卡',
    taste: ['日式'], method: '煮',
    ingredients: ['豆腐 半块', '海带', '味噌酱', '葱花', '柴鱼片（可选）', '水'],
    steps: [
      { text: '海带提前泡发切小片，豆腐切1cm小方块。', emoji: '🔪' },
      { text: '锅中水烧开，放入海带煮3分钟出鲜味。', emoji: '🍲' },
      { text: '加入豆腐块，小火煮2分钟至豆腐热透。', emoji: '🥘' },
      { text: '关火后溶入味噌酱（不要煮沸），撒葱花和柴鱼片。', emoji: '✨' }
    ],
    protein: '8g', carbs: '6g', fat: '3g', tags: ['日料', '低卡']
  },
  {
    id: 15, name: '懒人电饭煲焖饭',
    emoji: '🍛', heroColor: '#F5E8D5',
    time: '40分钟', difficulty: '简单', diffLevel: 0, calories: '约380千卡',
    taste: ['粤菜'], method: '煮',
    ingredients: ['大米 1杯', '腊肠 1根', '香菇 3朵', '胡萝卜', '豌豆', '生抽', '蚝油'],
    steps: [
      { text: '大米淘洗干净，加水（比平时少一点），放入电饭煲。', emoji: '💧' },
      { text: '腊肠切片，香菇泡发切丁，胡萝卜切丁，豌豆洗净。', emoji: '🔪' },
      { text: '所有配菜铺在米上，淋入生抽和蚝油。', emoji: '🥘' },
      { text: '按下煮饭键，跳闸后拌匀即可。懒人福音！', emoji: '✨' }
    ],
    protein: '12g', carbs: '48g', fat: '14g', tags: ['懒人', '一锅出']
  }
];
