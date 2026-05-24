export const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

export const COPY = {
  ko: {
    langSelect: '언어 선택',
    langMenuTitle: '언어',
    scrollTop: '맨 위로 올라가기',
    hero: {
      h1: ['외로운 독백 면접은', '끝났습니다.', '이제, 압박 면접과', '마주할 시간.'],
      h1Mark: { lineIndex: 3, word: '마주' },
      desc:
        '옆자리 지원자의 화려한 답변에 멘탈이 털린 적 있나요? 다대다 면접은 처음이라 어떻게 준비해야할지 막막하신가요? 나를 합격으로 이끌어줄 든든하고 상쾌한 AI 스터디 파트너와 함께, 가장 실전에 가까운 다대다 면접을 경험하세요.',
    },
    form: {
      emailPlaceholder: '이메일을 입력해 주세요',
      emailLabel: '이메일',
      featurePlaceholder: 'MAJU에 이런 기능도 있었으면 좋겠어요! (선택)',
      featureLabel: '기능 제안 (선택)',
      submit: '1초 만에 사전신청하기',
      submitting: '신청 중...',
      error: '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      successTitle: '사전 예약이 완료되었습니다!',
      successDesc: '출시 후 가장 먼저 안내해 드리겠습니다.',
    },
    benefit: {
      prefix: '지금 사전 신청 시,',
      badge: '선착순 100명',
      suffix: '에게',
      highlight: '1년 무료 프리미엄 패스',
      end: '를 드립니다.',
    },
    video: {
      title: 'MAJU · 다대다 면접 시뮬레이션',
      end: '종료',
      coachHint: '말이 빨라지고 있어요. 숨 고르고 천천히.',
      participants: [
        { label: '나', sub: '내 화면' },
        { label: 'AI 면접관', sub: '압박 질문', badge: 'HOST' },
        { label: '가상 지원자 1', sub: '모범 답변' },
        { label: '가상 지원자 2', sub: '경쟁자' },
      ],
    },
    pain: {
      title: ['왜 AI 모의 면접을 연습해도', '실전에서 무너질까요?'],
      cards: [
        {
          title: '혼자 하는 독백',
          desc: '1:1 녹화 방식은 면접장의 팽팽한 공기를 절대 담아내지 못합니다.',
        },
        {
          title: '멘탈 붕괴',
          desc: "실제 탈락의 가장 큰 원인은 '옆 지원자의 유창한 답변'에서 오는 비교와 위축입니다.",
        },
        {
          title: '뻔한 질문',
          desc: '내 대답을 듣지 않고 준비된 질문만 던지는 봇은 실력 향상에 도움이 안 됩니다.',
        },
      ],
    },
    features: {
      title: ['압도적인 실전 감각,', 'MAJU만의 3가지 강점'],
      items: [
        {
          title: "완벽하게 구현된 '피어 프레셔(Peer Pressure)'",
          desc: '나보다 유창하게 답변하는 가상 경쟁자 AI들을 배치하여 실전 면접장의 팽팽한 긴장감을 그대로 재현합니다. 옆 사람의 답변에 페이스를 잃지 않는 강력한 멘탈 훈련을 시작하세요.',
        },
        {
          title: "시선과 페이스를 잡아주는 '실시간 HUD 코치'",
          desc: '답변 도중 눈동자가 흔들리거나 말이 빨라지면 화면 구석에 즉시 조용히 경고와 가이드를 띄워줍니다. 면접이 끝난 후가 아닌, 실시간으로 피드백을 생성합니다.',
        },
        {
          title: "내 맞춤형 'AI 면접관 페르소나'",
          desc: '준비 중인 채용 공고문이나 면접 족보를 입력하세요. 온화한 경청형부터 날카로운 꼬리 질문으로 압박하는 면접관까지 당신만을 위한 완벽한 맞춤형 환경을 제공합니다.',
        },
      ],
      visual: {
        me: '나',
        candidate: '지원자',
        peerBanner: '옆 지원자 모범 답변 재생 중…',
        gaze: '시선 고정 유지',
        speed: '말 속도 ↑',
        personas: ['온화한 경청형', '압박 면접관', '꼬리 질문형'],
      },
    },
    reverse: {
      title: [
        '다대다 면접이 없다고요?',
        '가장 매운맛으로 훈련하면,',
        '1:1 면접은 대화처럼 편안해집니다.',
      ],
      desc: '실전에서 겪을 수 있는 최악의 압박 상황을 겪고 나면, 어떤 면접에서도 당신의 페이스를 유지할 수 있습니다.',
    },
    cta: {
      title: [
        '면접장의 숨 막히는 긴장감,',
        'MAJU와 함께라면',
        '상쾌한 자신감으로 바뀝니다.',
      ],
    },
    footer: '© 2026 MAJU. All rights reserved.',
  },
  en: {
    langSelect: 'Select language',
    langMenuTitle: 'Language',
    scrollTop: 'Back to top',
    hero: {
      h1: [
        'Solo mock interviews',
        'are over.',
        'Now face',
        'the pressure.',
      ],
      h1Mark: { lineIndex: 2, word: 'face' },
      desc: 'Ever lost your nerve to a polished answer from the candidate next to you? Train with a refreshing AI study partner built for the most realistic group interview experience.',
    },
    form: {
      emailPlaceholder: 'Enter your email',
      emailLabel: 'Email',
      featurePlaceholder: 'Wish MAJU had this feature! (optional)',
      featureLabel: 'Feature suggestion (optional)',
      submit: 'Join waitlist in 1 second',
      submitting: 'Submitting...',
      error: 'Submission failed. Please try again shortly.',
      successTitle: "You're on the waitlist!",
      successDesc: "We'll reach out first when we launch.",
    },
    benefit: {
      prefix: 'Pre-register now —',
      badge: 'First 100',
      suffix: 'receive a',
      highlight: '1-year free premium pass',
      end: '.',
    },
    video: {
      title: 'MAJU · Group interview simulation',
      end: 'End',
      coachHint: 'You are speaking fast. Breathe and slow down.',
      participants: [
        { label: 'You', sub: 'Your feed' },
        { label: 'AI Interviewer', sub: 'Pressure Qs', badge: 'HOST' },
        { label: 'Virtual Candidate 1', sub: 'Model answer' },
        { label: 'Virtual Candidate 2', sub: 'Rival' },
      ],
    },
    pain: {
      title: [
        'Why do AI mock interviews',
        'still fail you in the real room?',
      ],
      cards: [
        {
          title: 'Talking to yourself',
          desc: '1:1 recording cannot recreate the tense atmosphere of a real interview room.',
        },
        {
          title: 'Mental collapse',
          desc: "The top reason candidates choke is comparing themselves to a fluent peer sitting right beside them.",
        },
        {
          title: 'Canned questions',
          desc: 'Bots that ignore your answers and only read scripted prompts do not improve your skills.',
        },
      ],
    },
    features: {
      title: ['Real interview pressure,', "MAJU's 3 core strengths"],
      items: [
        {
          title: "True 'Peer Pressure' simulation",
          desc: 'Virtual rivals answer more fluently than you, recreating the tense energy of a real group interview room. Train the mental strength to keep your pace when someone beside you sounds brilliant.',
        },
        {
          title: "A real-time HUD coach for gaze and pace",
          desc: 'If your eyes wander or your pace speeds up, quiet warnings and guides appear in the corner instantly — feedback in the moment, not after the interview ends.',
        },
        {
          title: "Your custom AI interviewer persona",
          desc: 'Paste the job posting or your prep notes. From a gentle listener to a sharp interviewer who pressures you with follow-up questions — a tailored setup built just for you.',
        },
      ],
      visual: {
        me: 'You',
        candidate: 'Candidate',
        peerBanner: 'Playing peer model answer…',
        gaze: 'Hold eye contact',
        speed: 'Pace ↑',
        personas: ['Gentle listener', 'Pressure interviewer', 'Follow-up grill'],
      },
    },
    reverse: {
      title: [
        'No group interviews?',
        'Train at the hardest level,',
        'and 1:1 feels like a chat.',
      ],
      desc: 'Survive the worst-case pressure in practice, and you can keep your pace in any interview room.',
    },
    cta: {
      title: [
        'Crushing interview nerves,',
        'with MAJU become',
        'refreshing confidence.',
      ],
    },
    footer: '© 2026 MAJU. All rights reserved.',
  },
  ja: {
    langSelect: '言語を選択',
    langMenuTitle: '言語',
    scrollTop: 'ページ上部へ',
    hero: {
      h1: ['孤独な独り言面接は', '終わりました。', 'さあ、圧迫面接と', '向き合う時間。'],
      h1Mark: { lineIndex: 3, word: '向き合う' },
      desc:
        '隣の候補者の見事な回答に心が折れたことはありませんか？グループ面接が初めてで、どう準備すればいいか分からない方も。合格へ導く頼もしく爽やかなAIスタディパートナーと、最も実戦に近いグループ面接を体験してください。',
    },
    form: {
      emailPlaceholder: 'メールアドレスを入力してください',
      emailLabel: 'メールアドレス',
      featurePlaceholder: 'MAJUにこんな機能があったらいいな！（任意）',
      featureLabel: '機能の提案（任意）',
      submit: '1秒で事前登録',
      submitting: '送信中...',
      error: '送信に失敗しました。しばらくしてから再度お試しください。',
      successTitle: '事前登録が完了しました！',
      successDesc: 'リリース後、いち早くご案内いたします。',
    },
    benefit: {
      prefix: '今事前登録すると、',
      badge: '先着100名',
      suffix: 'に',
      highlight: '1年間無料プレミアムパス',
      end: 'をプレゼント。',
    },
    video: {
      title: 'MAJU · グループ面接シミュレーション',
      end: '終了',
      coachHint: '話すペースが速くなっています。深呼吸してゆっくり。',
      participants: [
        { label: '自分', sub: '自分の画面' },
        { label: 'AI面接官', sub: '圧迫質問', badge: 'HOST' },
        { label: '仮想候補者1', sub: '模範回答' },
        { label: '仮想候補者2', sub: 'ライバル' },
      ],
    },
    pain: {
      title: ['なぜAI模擬面接を練習しても', '本番で崩れてしまうのか？'],
      cards: [
        {
          title: '一人きりの独り言',
          desc: '1対1の録画形式では、面接会場の張り詰めた空気を再現できません。',
        },
        {
          title: 'メンタル崩壊',
          desc: '実際の不合格の最大の原因は、隣の候補者の流暢な回答による比較と萎縮です。',
        },
        {
          title: 'ありきたりな質問',
          desc: 'あなたの回答を聞かず、用意された質問だけを投げるボットは、実力向上に役立ちません。',
        },
      ],
    },
    features: {
      title: ['圧倒的な実戦感覚、', 'MAJUの3つの強み'],
      items: [
        {
          title: '完全再現の「ピアプレッシャー」',
          desc: 'あなたより流暢に答える仮想ライバルAIを配置し、実戦の面接会場の張り詰めた緊張感をそのまま再現。隣の回答にペースを乱さない強力なメンタルトレーニングを始めましょう。',
        },
        {
          title: '視線とペースを支える「リアルタイムHUDコーチ」',
          desc: '回答中に視線が泳いだり話す速さが上がると、画面隅に静かに警告とガイドを表示。面接後ではなく、その場でフィードバックを生成します。',
        },
        {
          title: 'あなた専用の「AI面接官ペルソナ」',
          desc: '準備中の求人票や面接攻略本を入力。穏やかな傾聴型から鋭い追撃質問で圧迫する面接官まで、あなただけの完璧なカスタム環境を提供します。',
        },
      ],
      visual: {
        me: '自分',
        candidate: '候補者',
        peerBanner: '隣の候補者の模範回答を再生中…',
        gaze: '視線を固定',
        speed: '話速 ↑',
        personas: ['穏やかな傾聴型', '圧迫面接官', '追撃質問型'],
      },
    },
    reverse: {
      title: [
        'グループ面接がない？',
        '最辛レベルで鍛えれば、',
        '1対1は会話のように楽になります。',
      ],
      desc: '本番で起こりうる最悪の圧迫状況を経験すれば、どんな面接でも自分のペースを保てます。',
    },
    cta: {
      title: [
        '面接会場の息苦しい緊張感、',
        'MAJUと一緒なら',
        '爽やかな自信に変わります。',
      ],
    },
    footer: '© 2026 MAJU. All rights reserved.',
  },
};
