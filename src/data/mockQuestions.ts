import type { ObstacleData, Round1Question, Team } from '../types/game';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Đội 1: Sao Khuê',
    score: 0,
    canGuessObstacle: true,
    color: '#3B82F6', // Blue
  },
  {
    id: 'team-2',
    name: 'Đội 2: Kim Quy',
    score: 0,
    canGuessObstacle: true,
    color: '#EAB308', // Gold / Amber
  },
  {
    id: 'team-3',
    name: 'Đội 3: Hỏa Long',
    score: 0,
    canGuessObstacle: true,
    color: '#EF4444', // Red
  },
  {
    id: 'team-4',
    name: 'Đội 4: Thăng Long',
    score: 0,
    canGuessObstacle: true,
    color: '#10B981', // Emerald
  },
];

export const MOCK_ROUND1_QUESTIONS: Round1Question[] = [
  {
    id: 1,
    question: 'Theo Giáo trình, sức mạnh dân tộc Việt Nam là sự tổng hợp của các yếu tố vật chất và tinh thần, mà trước hết là sức mạnh của chủ nghĩa nào?',
    options: [
      'Chủ nghĩa yêu nước',
      'Chủ nghĩa quốc tế vô sản',
      'Chủ nghĩa Mác - Lênin',
      'Chủ nghĩa xã hội khoa học',
    ],
    answer: 'Chủ nghĩa yêu nước (và ý thức tự lực, tự cường dân tộc)',
    correctOptionIndex: 0,
    timeLimit: 10,
  },
  {
    id: 2,
    question: 'Sức mạnh thời đại trong tư tưởng Hồ Chí Minh được xác lập gắn liền với thắng lợi của cuộc cách mạng nào trên thế giới vào năm 1917?',
    options: [
      'Cách mạng Tân Hợi (1911)',
      'Cách mạng Tháng Mười Nga (1917)',
      'Cách mạng Tháng Hai Nga (1917)',
      'Công xã Paris (1871)',
    ],
    answer: 'Cách mạng Tháng Mười Nga',
    correctOptionIndex: 1,
    timeLimit: 10,
  },
  {
    id: 3,
    question: 'Vào tháng 9/1947, khi trả lời nhà báo Mỹ S. Eli Maysi, Chủ tịch Hồ Chí Minh đã tuyên bố câu nói nổi tiếng nào về chính sách đối ngoại của nước Việt Nam mới?',
    options: [
      '"Làm bạn với tất cả mọi nước dân chủ và không gây thù oán với một ai"',
      '"Việt Nam sẵn sàng là bạn, là đối tác tin cậy của các nước trong cộng đồng quốc tế"',
      '"Đoàn kết, đoàn kết, đại đoàn kết; Thành công, thành công, đại thành công"',
      '"Dĩ bất biến, ứng vạn biến"',
    ],
    answer: '"Làm bạn với tất cả mọi nước dân chủ và không gây thù oán với một ai"',
    correctOptionIndex: 0,
    timeLimit: 10,
  },
  {
    id: 4,
    question: 'Điền các từ còn thiếu vào câu nói của Bác Hồ về mối quan hệ giữa nội lực và ngoại giao: "Thực lực là cái chiêng, ngoại giao là cái tiếng, chiêng có to..."?',
    options: [
      '...tiếng mới vang',
      '...tiếng mới lớn',
      '...ngoại giao mới mạnh',
      '...chuông mới kêu',
    ],
    answer: '...tiếng mới lớn',
    correctOptionIndex: 1,
    timeLimit: 10,
  },
  {
    id: 5,
    question: 'Bác Hồ đã khẳng định câu nói nào về tinh thần tự lực cánh sinh trong kháng chiến chống Pháp: "Một dân tộc không tự lực cánh sinh mà cứ ngồi chờ dân tộc khác giúp đỡ thì..."?',
    options: [
      '...không thể nào chiến thắng kẻ thù',
      '...sẽ mãi chịu ách nô lệ, áp bức',
      '...không xứng đáng được độc lập',
      '...sẽ tự đánh mất quyền tự quyết',
    ],
    answer: '...không xứng đáng được độc lập',
    correctOptionIndex: 2,
    timeLimit: 10,
  },
  {
    id: 6,
    question: 'Hệ thống mặt trận đoàn kết quốc tế do Chủ tịch Hồ Chí Minh định hình bao gồm tổng cộng bao nhiêu tầng mặt trận?',
    options: [
      '2 tầng mặt trận',
      '3 tầng mặt trận',
      '4 tầng mặt trận',
      '5 tầng mặt trận',
    ],
    answer: '4 tầng mặt trận (Đại đoàn kết dân tộc; Việt - Lào - Campuchia; Nhân dân Á - Phi; Nhân dân thế giới đoàn kết với Việt Nam)',
    correctOptionIndex: 2,
    timeLimit: 10,
  },
  {
    id: 7,
    question: 'Theo Giáo trình, 3 lực lượng đoàn kết quốc tế chính bao gồm: Phong trào cộng sản và công nhân quốc tế, Phong trào giải phóng dân tộc và phong trào nào?',
    options: [
      'Phong trào hòa bình, dân chủ thế giới',
      'Phong trào Không liên kết (NAM)',
      'Phong trào công nhân các nước tư bản phát triển',
      'Phong trào thanh niên sinh viên quốc tế',
    ],
    answer: 'Phong trào hòa bình, dân chủ thế giới (hoặc phong trào chống chiến tranh xâm lược)',
    correctOptionIndex: 0,
    timeLimit: 10,
  },
  {
    id: 8,
    question: 'Tờ báo bằng tiếng Pháp do Nguyễn Ái Quốc sáng lập năm 1922 tại Pháp nhằm thức tỉnh tinh thần đấu tranh của nhân dân các thuộc địa có tên gọi là gì?',
    options: [
      'L\'Humanité (Báo Nhân Đạo)',
      'Báo Le Paria (Báo Người Cùng Khổ)',
      'Báo Thanh Niên',
      'Báo Việt Nam Hồn',
    ],
    answer: 'Báo Le Paria (Báo Người Cùng Khổ)',
    correctOptionIndex: 1,
    timeLimit: 10,
  },
  {
    id: 9,
    question: 'Phương châm đối ngoại "Muốn là bạn với tất cả các nước trong cộng đồng quốc tế" được Đảng ta chính thức đề ra tại Đại hội đại biểu toàn quốc lần thứ mấy?',
    options: [
      'Đại hội VI (năm 1986)',
      'Đại hội VII (năm 1991)',
      'Đại hội VIII (năm 1996)',
      'Đại hội IX (năm 2001)',
    ],
    answer: 'Đại hội VII (năm 1991)',
    correctOptionIndex: 1,
    timeLimit: 10,
  },
  {
    id: 10,
    question: 'Theo Giáo trình, yếu tố nào giữ vai trò quyết định thắng lợi của việc tranh thủ nguồn lực bên ngoài: nguồn lực nội sinh hay nguồn lực ngoại sinh?',
    options: [
      'Nguồn lực nội sinh (Nội lực bên trong)',
      'Nguồn lực ngoại sinh (Sự giúp đỡ quốc tế)',
      'Cả hai nguồn lực giữ vai trò ngang nhau',
      'Tùy thuộc vào từng thời kỳ lịch sử cụ thể',
    ],
    answer: 'Nguồn lực nội sinh (Nội lực giữ vai trò quyết định, ngoại lực chỉ phát huy tác dụng thông qua nguồn lực nội sinh)',
    correctOptionIndex: 0,
    timeLimit: 10,
  },
];

export const MOCK_OBSTACLE_DATA: ObstacleData = {
  keyword: 'TRỐNG ĐỒNG ĐÔNG SƠN',
  description: 'Biểu tượng văn hóa tinh hoa của nền văn minh lúa nước và lịch sử người Việt cổ thời kỳ Hùng Vương.',
  // High quality Unsplash image of bronze drum culture / ancient heritage
  imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80',
  isFullyRevealed: false,
  clues: [
    {
      id: 1,
      rowLabel: 'Hàng ngang 1 (9 chữ cái)',
      question: 'Thời kỳ các vua nào trong truyền thuyết được coi là đã sáng lập nên nhà nước Văn Lang cổ đại?',
      answer: 'HÙNG VƯƠNG',
      isRevealed: false,
      timeLimit: 15,
    },
    {
      id: 2,
      rowLabel: 'Hàng ngang 2 (8 chữ cái)',
      question: 'Kim loại chủ đạo được cư dân Việt cổ sử dụng để đúc ra các nhạc khí và vũ khí thời đồ đồng là gì?',
      answer: 'ĐỒNG THAU',
      isRevealed: false,
      timeLimit: 15,
    },
    {
      id: 3,
      rowLabel: 'Hàng ngang 3 (7 chữ cái)',
      question: 'Hình tượng loài chim sải cánh bay được khắc họa rất nhiều trên mặt trống đồng cổ đại là chim gì?',
      answer: 'CHIM LẠC',
      isRevealed: false,
      timeLimit: 15,
    },
    {
      id: 4,
      rowLabel: 'Hàng ngang 4 (7 chữ cái)',
      question: 'Hình tượng ngôi sao nhiều cánh ở chính giữa mặt trống đồng tượng trưng cho điều gì trong tín ngưỡng sơ khai?',
      answer: 'MẶT TRỜI',
      isRevealed: false,
      timeLimit: 15,
    },
  ],
};

export function getCorrectOptionIndex(q?: Partial<Round1Question> | null): number {
  if (!q) return 0;
  if (typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0) {
    return q.correctOptionIndex;
  }
  // Lookup in MOCK_ROUND1_QUESTIONS by ID
  const mockQ = MOCK_ROUND1_QUESTIONS.find(m => m.id === q.id);
  if (mockQ && typeof mockQ.correctOptionIndex === 'number') {
    return mockQ.correctOptionIndex;
  }
  // Lookup by matching answer string in options
  if (q.options && q.answer) {
    const cleanAnswer = q.answer.toLowerCase();
    const idx = q.options.findIndex(opt => {
      const cleanOpt = opt.toLowerCase();
      return cleanAnswer.includes(cleanOpt) || cleanOpt.includes(cleanAnswer);
    });
    if (idx !== -1) return idx;
  }
  return 0;
}
