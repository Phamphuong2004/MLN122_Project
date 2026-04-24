import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Circle,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ═══════════════════ TYPES ═══════════════════

export type CharacterClass = "worker" | "student" | "technician";
type SceneId =
  | "prologue"
  | "baotu"
  | "robots"
  | "overtime"
  | "reserve_army"
  | "crossroads"
  | "path_a1"
  | "path_a2"
  | "path_b1"
  | "path_b2"
  | "path_c1"
  | "path_c2";
type EndingId = "ending_a" | "ending_b" | "ending_c" | "ending_scholar";
export type Phase =
  | "landing"
  | "rules"
  | "presentation"
  | "create"
  | "intro_slides"
  | "ai_usage"
  | "scene"
  | "feedback"
  | "battle"
  | "management"
  | "challenge"
  | "cinema"
  | "ending";

export interface Stats {
  knowledge: number;
  willpower: number;
  wealth: number;
  social: number;
}

interface EconomyStats {
  c: number; // Tư bản bất biến (máy móc)
  v: number; // Tư bản khả biến (tiền lương)
  m: number; // Giá trị thặng dư
  totalValue: number; // G = c + v + m
  m_prime: number; // Tỷ suất thặng dư (m/v)
  cv_ratio: number; // Cấu tạo hữu cơ (c/v)
  extraM: number; // Thặng dư siêu ngạch
}

export interface Character {
  name: string;
  characterClass: CharacterClass;
  emoji: string;
  classLabel: string;
  stats: Stats;
  gems: string[];
  history: string[];
  achievements: string[]; // IDs của achievements đã unlock
}

interface StatEffect {
  knowledge?: number;
  willpower?: number;
  wealth?: number;
  social?: number;
  gem?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  condition: (char: Character, sceneId: SceneId) => boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Challenge {
  id: string;
  title: string;
  scenario: string;
  question: string;
  stakes: string;
  hints?: Partial<Record<CharacterClass, string>>;
  options: Array<{
    text: string;
    isCorrect: boolean;
    feedback: string;
    reward: StatEffect;
  }>;
  penalty: StatEffect;
  emoji: string;
}

interface Choice {
  text: string;
  feedback: string;
  effect: StatEffect;
  next: SceneId | "battle" | EndingId;
  conceptTag?: string;
  requirement?: { stat: keyof Stats; min: number }; // Điều kiện mở khóa
  roleBonus?: CharacterClass; // Role nào được bonus khi chọn
}

interface NPC {
  name: string;
  emoji: string;
  role: string;
  dialogue: string;
}

interface Scene {
  id: SceneId;
  title: string;
  setting: string;
  bgAccent: string;
  narrative: string;
  npc?: NPC;
  choices: Choice[];
  challengeId?: string; // Optional challenge to trigger before choices
}

interface BattleOption {
  text: string;
  type: "correct" | "partial" | "wrong";
  response: string;
  enemyDmg: number;
  playerDmg: number;
}
interface BattleRound {
  enemyLine: string;
  options: BattleOption[];
}

interface BattleState {
  playerHP: number;
  enemyHP: number;
  round: number;
  phase: "attack" | "choose" | "result" | "complete";
  lastResult: {
    type: string;
    response: string;
    enemyDmg: number;
    playerDmg: number;
  } | null;
  won: boolean;
}

interface IntroSlide {
  title: string;
  content: string;
  keyPoints: string[];
  image: string;
}

// ═══════════════════ CHARACTER CLASSES ═══════════════════

const CLASS_CONFIGS: Record<
  CharacterClass,
  {
    label: string;
    emoji: string;
    desc: string;
    stats: Stats;
    perk: string;
    color: string;
  }
> = {
  worker: {
    label: "Công Nhân",
    emoji: "👷",
    desc: "Kinh nghiệm thực tiễn phong phú, thấu hiểu nỗi vất vả lao động từ bên trong",
    stats: { knowledge: 25, willpower: 65, wealth: 25, social: 45 },
    perk: "+Ý chí cao · +Kinh nghiệm thực tế · Hiểu tâm tư công nhân",
    color: "var(--primary)",
  },
  student: {
    label: "Sinh Viên",
    emoji: "🎓",
    desc: "Nền tảng lý luận vững chắc, khả năng phân tích tư duy nhạy bén",
    stats: { knowledge: 65, willpower: 35, wealth: 20, social: 50 },
    perk: "+Kiến thức cao · +Tư duy phân tích · Bonus trong tranh luận lý luận",
    color: "var(--secondary)",
  },
  technician: {
    label: "Kỹ Thuật Viên",
    emoji: "💻",
    desc: "Kỹ năng công nghệ cao, hiểu biết sâu về máy móc và hệ thống tự động hóa",
    stats: { knowledge: 40, willpower: 30, wealth: 55, social: 35 },
    perk: "+Kỹ năng công nghệ · +Hiểu biết máy móc · Bonus khi tương tác với AI/Robot",
    color: "var(--accent)",
  },
};

const ACHIEVEMENTS: Record<string, Achievement> = {
  theorist: {
    id: "theorist",
    title: "Nhà Lý Luận",
    description: "Đạt Knowledge ≥ 80",
    emoji: "🧠",
    condition: (char) => char.stats.knowledge >= 80,
    rarity: "epic",
  },
  activist: {
    id: "activist",
    title: "Chiến Sĩ Lao Động",
    description: "Đạt Social ≥ 70 và Willpower ≥ 60",
    emoji: "✊",
    condition: (char) => char.stats.social >= 70 && char.stats.willpower >= 60,
    rarity: "epic",
  },
  engineer: {
    id: "engineer",
    title: "Kỹ Sư Tương Lai",
    description: "Đạt Knowledge ≥ 60 và Wealth ≥ 55",
    emoji: "🔬",
    condition: (char) => char.stats.knowledge >= 60 && char.stats.wealth >= 55,
    rarity: "epic",
  },
  visionary: {
    id: "visionary",
    title: "Nhà Kiến Tạo",
    description: "Đạt Social ≥ 65 và Knowledge ≥ 50",
    emoji: "🌱",
    condition: (char) => char.stats.social >= 65 && char.stats.knowledge >= 50,
    rarity: "epic",
  },
  balanced: {
    id: "balanced",
    title: "Người Cân Bằng",
    description: "Tất cả stats ≥ 50",
    emoji: "⚖️",
    condition: (char) =>
      char.stats.knowledge >= 50 &&
      char.stats.willpower >= 50 &&
      char.stats.wealth >= 50 &&
      char.stats.social >= 50,
    rarity: "rare",
  },
  trueMarxist: {
    id: "trueMarxist",
    title: "Cộng Sản Thực Thụ",
    description: "Hoàn thành game với tất cả lựa chọn đúng từ góc nhìn Mác",
    emoji: "🚩",
    condition: (char) => char.gems.length >= 7,
    rarity: "legendary",
  },
  speedrunner: {
    id: "speedrunner",
    title: "Chiến Binh Tốc Độ",
    description: "Hoàn thành game trong dưới 5 lựa chọn",
    emoji: "⚡",
    condition: (char) => char.history.length <= 5,
    rarity: "rare",
  },
  completionist: {
    id: "completionist",
    title: "Nhà Thu Thập",
    description: "Lấy được 10 concepts gems",
    emoji: "💎",
    condition: (char) => char.gems.length >= 10,
    rarity: "rare",
  },
  studentPath: {
    id: "studentPath",
    title: "Sinh Viên Ưu Tú",
    description: "Đạo tạo lại chủ yếu bằng học vấn",
    emoji: "🎓",
    condition: (char) => char.characterClass === "student",
    rarity: "common",
  },
  workerPath: {
    id: "workerPath",
    title: "Công Nhân Anh Hùng",
    description: "Duy trì hành động như công nhân xuyên suốt",
    emoji: "🏭",
    condition: (char) => char.characterClass === "worker",
    rarity: "common",
  },
  techPath: {
    id: "techPath",
    title: "Chinh Phục Công Nghệ",
    description: "Phát triển con đường công nghệ",
    emoji: "⚙️",
    condition: (char) => char.characterClass === "technician",
    rarity: "common",
  },
};

// ═══════════════════ CHALLENGES DATA ═══════════════════

const CHALLENGES: Record<string, Challenge> = {
  value_vs_use: {
    id: "value_vs_use",
    title: "Biến Cố: Dây Chuyền Mới Khởi Động",
    scenario:
      "Khi robot đầu tiên ở tổ may được bật lên, vài quản lý lập tức tuyên bố rằng từ nay máy móc mới là thứ 'làm ra giá trị'. Một nhóm công nhân trẻ chững lại, bắt đầu tin rằng kinh nghiệm của họ sắp trở nên vô nghĩa. Bác Tư nhìn sang bạn, chờ bạn lên tiếng ngay tại chuyền.",
    question:
      "Bạn sẽ giải thích thế nào để giữ tinh thần tổ may và làm rõ bản chất của máy móc trong quá trình sản xuất?",
    stakes:
      "Nếu xử lý tốt, công nhân sẽ hiểu rằng lao động sống vẫn là trung tâm của giá trị mới. Nếu nói sai, cả tổ sẽ dễ chấp nhận logic 'máy móc thay người là lẽ tự nhiên'.",
    emoji: "🤔",
    hints: {
      student:
        "Gợi ý cho Sinh Viên: hãy bám vào phân biệt giữa giá trị sử dụng và giá trị trao đổi, rồi chỉ ra nguồn gốc giá trị mới.",
      worker:
        "Gợi ý cho Công Nhân: hãy nói từ trải nghiệm xưởng rằng robot chỉ hỗ trợ quy trình, còn người lao động vẫn tạo ra phần giá trị mới.",
      technician:
        "Gợi ý cho Kỹ Thuật Viên: hãy tách rõ năng suất kỹ thuật của robot khỏi câu hỏi 'ai tạo ra giá trị mới'.",
    },
    options: [
      {
        text: "Khẳng định robot tự tạo ra giá trị mới vì nó có giá thị trường cao và chạy nhanh hơn công nhân.",
        isCorrect: false,
        feedback:
          "Sai hướng. Máy móc là tư bản bất biến. Nó không tự sinh ra giá trị mới, mà chỉ chuyển dần giá trị của chính nó vào sản phẩm qua khấu hao.",
        reward: { knowledge: 5 },
      },
      {
        text: "Giải thích rằng robot không tạo ra giá trị mới, nó chỉ chuyển giá trị của nó vào hàng hóa; phần giá trị mới vẫn do lao động sống tạo ra.",
        isCorrect: true,
        feedback:
          "Chuẩn xác. Bạn chặn đứng sự ngộ nhận ngay tại xưởng: robot có thể tăng năng suất, nhưng chỉ lao động sống mới tạo ra giá trị mới và giá trị thặng dư.",
        reward: { knowledge: 15, willpower: 5 },
      },
      {
        text: "Nói rằng robot có tạo ra giá trị hay không chủ yếu tùy vào quốc gia sản xuất và thương hiệu của nó.",
        isCorrect: false,
        feedback:
          "Chưa đúng. Vấn đề không nằm ở thương hiệu hay quốc gia sản xuất, mà ở bản chất kinh tế của máy móc trong quá trình lao động.",
        reward: { knowledge: 3 },
      },
    ],
    penalty: { knowledge: -10 },
  },
  exploitation: {
    id: "exploitation",
    title: "Biến Cố: Bảng Lương Sau Tự Động Hóa",
    scenario:
      "Sau khi robot vào xưởng, ban quản lý treo bảng hiệu suất mới và nói rằng lợi nhuận tăng là do 'quản trị hiện đại'. Chị Mai kéo bạn lại trước đám đông: nếu không giải thích rõ nguồn gốc lợi nhuận, rất nhiều người sẽ nghĩ bóc lột chỉ là cảm giác chứ không có cơ sở lý luận.",
    question:
      "Bạn sẽ chỉ ra chính xác lợi nhuận của ông chủ hình thành ở đâu trong tình huống này?",
    stakes:
      "Nếu trả lời chắc tay, công nhân hiểu bản chất giá trị thặng dư. Nếu trả lời mơ hồ, cuộc tranh luận sẽ trôi sang những khẩu hiệu cảm tính.",
    emoji: "💼",
    hints: {
      student:
        "Gợi ý cho Sinh Viên: hãy bám vào phân chia thời gian lao động tất yếu và thời gian lao động thặng dư.",
      worker:
        "Gợi ý cho Công Nhân: hãy nói từ trải nghiệm ca làm rằng công nhân tạo ra nhiều hơn phần tiền công họ nhận được.",
      technician:
        "Gợi ý cho Kỹ Thuật Viên: đừng nhầm tăng năng suất với việc máy móc tự tạo lợi nhuận; hãy truy về phần lao động không được trả công.",
    },
    options: [
      {
        text: "Cho rằng lợi nhuận chủ yếu đến từ việc ông chủ giỏi quản trị và bán hàng tốt hơn.",
        isCorrect: false,
        feedback:
          "Sai trọng tâm. Quản trị hay lưu thông không phải nguồn gốc cuối cùng của lợi nhuận. Phần quyết định vẫn là lao động thặng dư mà công nhân không được trả công.",
        reward: { knowledge: 3 },
      },
      {
        text: "Chỉ ra rằng lợi nhuận nảy sinh từ 4 giờ lao động thặng dư, tức phần thời gian công nhân tạo ra giá trị nhưng không được trả tiền tương ứng.",
        isCorrect: true,
        feedback:
          "Rất sắc. Bạn giúp cả tổ nhìn rõ công thức đang ẩn sau bảng lương: phần lao động thặng dư chính là nguồn gốc của lợi nhuận, không phải phép màu quản trị.",
        reward: { knowledge: 20, social: 10, willpower: 10 },
      },
      {
        text: "Nói rằng lợi nhuận chỉ đơn giản đến từ chênh lệch giữa giá chi phí và giá bán ngoài thị trường.",
        isCorrect: false,
        feedback:
          "Mới chạm bề mặt. Chênh lệch giá chỉ là hình thức biểu hiện bên ngoài; nguồn gốc sâu hơn vẫn là giá trị thặng dư do lao động sống tạo ra.",
        reward: { knowledge: 8 },
      },
    ],
    penalty: { knowledge: -15, social: -5 },
  },
};

const INTRO_SLIDES = [
  {
    title: "1. Bản chất Lao động trong Kỷ nguyên Số",
    content:
      "Vận dụng lý luận của C. Mác về tính hai mặt của lao động sản xuất hàng hóa, ta thấy công nghệ số không làm thay đổi bản chất của lao động mà chỉ làm thăng hoa các hình thái biểu hiện. Lao động cụ thể chuyển dịch mạnh mẽ từ các thao tác thủ công cơ bắp sang các hình thức trí tuệ cao như lập trình, điều khiển hệ thống AI và quản trị dữ liệu lớn. Lao động trừu tượng trong kỷ nguyên này chủ yếu là sự tiêu hao sức thần kinh và trí não ở cường độ cao, nơi một giờ lao động của chuyên gia công nghệ kết tinh lượng giá trị lớn hơn nhiều lần lao động giản đơn. Đây chính là sự khẳng định cho luận điểm: Lao động phức tạp là bội số của lao động giản đơn trong nền kinh tế tri thức.",
    keyPoints: [
      "💪 Lao động cụ thể 4.0: Chuyển dịch từ 'thâm dụng cơ bắp' sang 'thâm dụng trí tuệ'. Đối tượng lao động mở rộng từ vật chất hữu hình sang dữ liệu số và các hệ thống thuật toán.",
      "🧠 Lao động trừu tượng & Trí tuệ: Sự hao phí sức lao động tính bằng cường độ tư duy, khả năng giải quyết vấn đề và sáng tạo thuật toán trong môi trường áp lực cao.",
      "🛠️ Quy luật giá trị: Dù công cụ là AI, giá trị hàng hóa vẫn do thời gian lao động xã hội cần thiết quyết định. Lao động phức tạp tạo ra giá trị kết tinh cao hơn hẳn.",
      "📱 'Vật hóa' tri thức: Các sản phẩm số là kết tinh của lao động trí tuệ đã được vật hóa, sẵn sàng tham gia vào quá trình sản xuất để tạo ra giá trị mới cho xã hội.",
      "🔬 Đối tượng lao động mới: Dữ liệu lớn (Big Data) trở thành 'nguyên liệu thô' mới mà lao động trí tuệ tác động vào để tạo ra các sản phẩm tri thức có giá trị sử dụng cao.",
      "🤝 Tính chất xã hội hóa: Lao động trong kỷ nguyên số có tính xã hội hóa cực cao, đòi hỏi sự phối hợp xuyên biên giới của hàng ngàn chuyên gia trong cùng một hệ sinh thái.",
    ],
    image: "slide_factory_bg_1776754822562.png",
  },
  {
    title: "2. AI, Robot và Quá trình Tạo ra Giá trị",
    content:
      "Dưới góc nhìn Marxist, AI và Robot dù thông minh đến đâu cũng chỉ đóng vai trò là Tư bản bất biến (c). Chúng là lao động quá khứ (lao động đã vật hóa) và chỉ chuyển dần giá trị bản thân vào sản phẩm qua khấu hao, không có khả năng tự tạo ra giá trị mới (v+m). Chỉ có Lao động sống (v) của con người mới là nguồn gốc duy nhất tạo ra giá trị thặng dư. Trong các hệ thống tự động hóa, thặng dư không mất đi mà chuyển dịch từ lao động trực tiếp sang đội ngũ lao động gián tiếp trình độ cao. AI đóng vai trò công cụ để thực hiện phương pháp sản xuất giá trị thặng dư tương đối thông qua việc tăng năng suất lao động xã hội vượt bậc.",
    keyPoints: [
      "⚙️ AI là Tư bản bất biến (c): Robot không thể bị 'bóc lột' vì không có nhu cầu sinh học. Chúng chỉ là phương tiện để lao động sống khai thác tài nguyên và dữ liệu hiệu quả hơn.",
      "👨‍💻 Vai trò của Lao động sống (v): Con người là 'chủ thể điều khiển trí tuệ'. Giá trị thặng dư nảy sinh từ việc người lao động kỹ thuật cao tạo ra giá trị vượt xa chi phí tái sản xuất sức lao động.",
      "📈 Thặng dư tương đối & Siêu ngạch: AI giúp rút ngắn thời gian lao động tất yếu, kéo dài thời gian lao động thặng dư. Doanh nghiệp làm chủ AI sớm sẽ thu được lợi nhuận siêu ngạch.",
      "🏗️ Tính thụ động của máy móc: Nếu không có con người thiết kế, bảo trì và ra quyết định, hệ thống AI chỉ là 'tư bản chết', không thể tham gia vào vòng tuần hoàn tạo ra giá trị.",
      "📉 Chuyển dịch giá trị: Giá trị của AI được chuyển dịch vào hàng hóa theo tỷ lệ hao mòn vật chất và hao mòn vô hình (do sự tiến bộ nhanh chóng của công nghệ mới).",
      "💰 Mâu thuẫn cơ bản: Sự thay thế lao động sống bằng AI làm thay đổi cấu tạo hữu cơ của tư bản, dẫn đến xu hướng tỷ suất lợi nhuận giảm sút nếu không có sự điều chỉnh quan hệ sản xuất.",
    ],
    image: "slide_value_blueprint_1776754840436.png",
  },
  {
    title: "3. Chiến lược Phát triển Nhân lực Việt Nam",
    content:
      "Để thoát khỏi bẫy thu nhập trung bình, Việt Nam đang thực hiện chuyển dịch mạnh mẽ cấu trúc lao động quốc gia. Chiến lược đến năm 2030 tập trung vào việc biến người lao động thành những 'chủ thể làm chủ công nghệ' thay vì chỉ là người sử dụng. Chúng ta ưu tiên phát triển các ngành mũi nhọn như công nghiệp bán dẫn, vi mạch và AI – nơi lao động sống kết tinh vào sản phẩm dưới dạng hàm lượng tri thức cực cao. Mục tiêu là nâng cao vị thế của Việt Nam trong chuỗi giá trị toàn cầu, từ khâu lắp ráp tiến lên thiết kế, nghiên cứu và quản trị hệ thống sản xuất thông minh.",
    keyPoints: [
      "🇻🇳 Chuyển dịch cấu trúc: Giảm dần tỷ trọng lao động giản đơn, tăng nhanh tỷ trọng lao động có kỹ năng số. Đây là con đường tất yếu để nâng cao năng suất lao động quốc gia.",
      "🚀 Đào tạo nhân lực mũi nhọn: Tập trung nguồn lực cho các ngành công nghệ lõi. Một kỹ sư bán dẫn có thể tạo ra giá trị thặng dư bằng hàng trăm lao động giản đơn cộng lại.",
      "🏭 Thực tiễn hóa lý luận: Các tập đoàn lớn đang tiên phong xây dựng các nhà máy thông minh, nơi công nhân được đào tạo lại để trở thành những kỹ thuật viên điều hành Robot.",
      "🌍 Chủ quyền công nghệ: Phát triển nhân lực không chỉ để đi làm thuê mà để xây dựng các giải pháp 'Make in Vietnam', giữ lại phần lớn giá trị thặng dư trên đất nước.",
      "🎓 Đổi mới tư duy: Chuyển từ tư duy 'gia công' sang tư duy 'sáng tạo' and 'thiết kế', phù hợp với yêu cầu của thời đại kinh tế số và cách mạng công nghiệp lần thứ tư.",
      "🛡️ Bảo hộ lao động số: Xây dựng khung pháp lý để bảo vệ quyền lợi người lao động trong các mô hình kinh tế mới như kinh tế nền tảng (Gig economy) và làm việc từ xa.",
    ],
    image: "slide_factory_bg_1776754822562.png",
  },
  {
    title: "4. Hệ sinh thái Giáo dục và Thách thức",
    content:
      "Sự bùng nổ của AI đặt ra yêu cầu cấp bách về việc xây dựng một hệ sinh thái Giáo dục - Doanh nghiệp bền vững. Học tập suốt đời không còn là khẩu hiệu mà là điều kiện sinh tồn. Chúng ta cần thu hẹp hố ngăn cách số giữa các vùng miền và tầng lớp lao động, đảm bảo sự công bằng trong tiếp cận công nghệ. Thách thức lớn nhất không phải là việc máy móc thay thế con người, mà là con người có đủ bản lĩnh và tri thức để bắt máy móc phục vụ cho mục tiêu giải phóng sức lao động, hướng tới một xã hội nơi con người có điều kiện phát triển tự do, toàn diện.",
    keyPoints: [
      "🔄 Re-skilling & Up-skilling: Xây dựng lộ trình đào tạo lại liên tục. Người lao động cần trang bị khả năng tự học để không bao giờ bị tụt hậu trước sự thay đổi của thuật toán.",
      "🤝 Liên kết Nhà trường - Doanh nghiệp: Xóa bỏ khoảng cách giữa lý thuyết và thực hành. Đưa các bài toán thực tế của doanh nghiệp vào giảng đường để sinh viên 'thực chiến'.",
      "🚫 Thu hẹp hố ngăn cách số: Chính sách nhà nước cần hỗ trợ nhóm lao động yếu thế tiếp cận kỹ năng số, ngăn chặn tình trạng bất bình đẳng mới phát sinh từ công nghệ.",
      "🌟 Mục tiêu nhân văn: Mác hướng tới việc máy móc làm thay việc nặng để con người có thời gian sáng tạo văn hóa. Đó chính là ý nghĩa tối cao của chuyển đổi số xã hội chủ nghĩa.",
      "📊 Quản trị bằng dữ liệu: Nâng cao năng lực quản trị nhà nước và quản trị doanh nghiệp bằng dữ liệu lớn, giúp tối ưu hóa việc phân bổ nguồn lực lao động xã hội.",
      "🌱 Đạo đức AI & Con người: Khẳng định vai trò quyết định của đạo đức và trách nhiệm con người trong việc kiểm soát các hệ thống trí tuệ nhân tạo, hướng tới sự phát triển bền vững.",
    ],
    image: "slide_value_blueprint_1776754840436.png",
  },
];

// ═══════════════════ BATTLE DATA ═══════════════════

const BATTLE: { enemy: NPC; rounds: BattleRound[] } = {
  enemy: {
    name: "Giám đốc Toàn",
    emoji: "👔",
    role: "Chủ nhà máy Sáng Nam · 20 năm kinh nghiệm",
    dialogue:
      "Tôi chỉ làm những gì tốt nhất cho nhà máy. Tự động hóa là con đường duy nhất để tồn tại!",
  },
  rounds: [
    {
      enemyLine:
        "Robot làm việc 24/7, năng suất gấp 10 người, không đòi lương, không đình công. Tự động hóa là tiến bộ tất yếu mà không ai có thể cưỡng lại được!",
      options: [
        {
          text: "Robot là TƯ BẢN BẤT BIẾN – chỉ chuyển dần giá trị của chính nó vào sản phẩm qua khấu hao. Chỉ lao động trừu tượng của CON NGƯỜI mới thực sự TẠO RA giá trị mới và giá trị thặng dư!",
          type: "correct",
          enemyDmg: 35,
          playerDmg: 0,
          response:
            "Xuất sắc! Mác phân biệt rõ: tư bản bất biến (c) – máy móc, robot – CHUYỂN giá trị; tư bản khả biến (v) – sức lao động người – TẠO RA giá trị mới (m). Giám đốc Toàn không có lời đáp!",
        },
        {
          text: "Công nhân cũng có thể làm việc hiệu quả hơn nếu được đào tạo tốt và có điều kiện làm việc tốt hơn!",
          type: "partial",
          enemyDmg: 15,
          playerDmg: 10,
          response:
            "Đúng một phần! Nhưng cần lập luận từ bản chất kinh tế chính trị sâu hơn – ông ấy có số liệu năng suất robot để phản bác.",
        },
        {
          text: "Robot hỏng liên tục, chi phí bảo trì đắt, không đáng tin cậy bằng người thật!",
          type: "wrong",
          enemyDmg: 5,
          playerDmg: 25,
          response:
            "Lập luận kỹ thuật này yếu – giám đốc lập tức đưa ra số liệu thực tế bác bỏ ngay. Bạn mất điểm đáng kế!",
        },
      ],
    },
    {
      enemyLine:
        "Chúng tôi trả lương đúng thỏa thuận, đúng luật lao động. Mọi thứ minh bạch, hợp pháp. Đây là giao dịch tự nguyện – công nhân đồng ý thì mới làm. Không có gì bất công cả!",
      options: [
        {
          text: 'Lương chỉ trả cho "thời gian lao động tất yếu" – nhưng công nhân còn tạo ra "thời gian lao động thặng dư" không được trả tiền! Chính phần đó là nguồn gốc LỢI NHUẬN của ông – đó là bóc lột dù có hợp đồng!',
          type: "correct",
          enemyDmg: 40,
          playerDmg: 0,
          response:
            "Tuyệt vời! m = m/v × 100% là tỷ suất bóc lột. Lợi nhuận đến từ phần lao động không được trả – không phải từ máy móc. Giám đốc Toàn lảng vảng...",
        },
        {
          text: "Hợp pháp không đồng nghĩa với công bằng – lịch sử đã chứng minh điều đó rất nhiều lần rồi!",
          type: "partial",
          enemyDmg: 20,
          playerDmg: 5,
          response:
            "Lập luận đạo đức đúng hướng! Nhưng thiếu cơ sở kinh tế chính trị vững chắc để đánh mạnh hơn.",
        },
        {
          text: "Lương của công nhân quá thấp so với mặt bằng! Phải tăng ngay 30% lên!",
          type: "wrong",
          enemyDmg: 0,
          playerDmg: 20,
          response:
            "Yêu cầu cụ thể nhưng không có lý luận nền tảng – bị phản bác ngay bằng số liệu thị trường.",
        },
      ],
    },
    {
      enemyLine:
        "Nếu không tự động hóa, đối thủ phá chúng tôi trong 2 năm. Toàn bộ 500 công nhân mất việc! Tôi đang PHẢI làm thế này để BẢO VỆ số còn lại. Đây là trách nhiệm, không phải lòng tham!",
      options: [
        {
          text: "Vấn đề không phải tự động hóa hay không – mà là AI SỞ HỮU thành quả và PHÂN PHỐI ra sao! Lợi nhuận từ robot phải có phần cho Quỹ Chuyển Đổi Lao Động. Đó mới là trách nhiệm thực sự!",
          type: "correct",
          enemyDmg: 50,
          playerDmg: 0,
          response:
            "ĐÒN KẾT! Đây là trái tim vấn đề – ai kiểm soát tư liệu sản xuất, ai hưởng thành quả. Giải pháp không phải chống robot mà là PHÂN PHỐI LẠI. Giám đốc Toàn gật đầu im lặng!",
        },
        {
          text: "Cần lộ trình rõ ràng: đào tạo lại miễn phí, trợ cấp chuyển đổi 24 tháng, thông báo trước ít nhất 6 tháng!",
          type: "partial",
          enemyDmg: 25,
          playerDmg: 0,
          response:
            "Giải pháp thực tế tốt! Nhưng chưa đụng đến vấn đề sở hữu và phân phối cơ bản. Vẫn gây áp lực đáng kể.",
        },
        {
          text: "Thà đóng cửa nhà máy còn hơn để robot thay thế con người! Giải tán hết đi!",
          type: "wrong",
          enemyDmg: 0,
          playerDmg: 30,
          response:
            "Lập luận cực đoan – ngay lập tức hại toàn bộ công nhân. Giám đốc phản bác dễ dàng và được nhiều người đồng ý hơn bạn!",
        },
      ],
    },
    {
      enemyLine:
        "Tại sao tôi phải quan tâm đến việc kéo dài ngày làm việc hay tăng cường độ? Đó là quyền của tôi khi đã trả lương đầy đủ cho các anh!",
      options: [
        {
          text: "Ông đang theo đuổi GIÁ TRỊ THẶNG DƯ TUYỆT ĐỐI bằng cách kéo dài ngày lao động quá mức. Nhưng Mác chỉ ra rằng tăng năng suất để rút ngắn thời gian tất yếu mới là GIÁ TRỊ THẶNG DƯ TƯƠNG ĐỐI – bản chất của tiến bộ kỹ thuật!",
          type: "correct",
          enemyDmg: 40,
          playerDmg: 0,
          response:
            "Rất sắc bén! Bạn đã chỉ ra sự khác biệt giữa bóc lột thô bạo (tuyệt đối) và bóc lột tinh vi qua công nghệ (tương đối). Giám đốc Toàn bắt đầu lúng túng.",
        },
        {
          text: "Làm thêm giờ nhiều quá công nhân sẽ kiệt sức và nhà máy sẽ tốn thêm tiền điện, tiền nước thôi!",
          type: "partial",
          enemyDmg: 15,
          playerDmg: 10,
          response:
            "Lập luận kinh tế thực dụng này có sức nặng, nhưng chưa đánh trúng bản chất lý luận về thặng dư mà ông Toàn đang che giấu.",
        },
        {
          text: "Sức khỏe là vàng, ông không thể bắt chúng tôi làm việc như trâu bò được!",
          type: "wrong",
          enemyDmg: 0,
          playerDmg: 20,
          response:
            "Lập luận cảm tính này không có tác dụng với một nhà quản lý coi trọng con số. Ông ấy phản pháo bằng hợp đồng lao động đã ký.",
        },
      ],
    },
    {
      enemyLine:
        "Nếu AI làm hết mọi việc, giá trị sản phẩm sẽ do AI tạo ra. Lúc đó các anh lấy gì mà đòi quyền lợi?",
      options: [
        {
          text: "Sai! AI chỉ là TƯ LIỆU SẢN XUẤT. Nếu không có con người vận hành và thiết kế (lao động phức tạp), AI chỉ là đống sắt vụn. Càng tự động hóa, vai trò của LAO ĐỘNG SỐNG càng trở nên quan trọng trong việc kiểm soát quy trình!",
          type: "correct",
          enemyDmg: 45,
          playerDmg: 0,
          response:
            "Đòn quyết định! Bạn khẳng định vị thế không thể thay thế của con người trong chuỗi giá trị. Giám đốc Toàn hoàn toàn bị thuyết phục.",
        },
        {
          text: "Chúng tôi sẽ học cách sửa AI, lúc đó ông vẫn cần chúng tôi thôi!",
          type: "partial",
          enemyDmg: 20,
          playerDmg: 5,
          response:
            "Đúng hướng nhưng cần nhấn mạnh vào bản chất tạo ra giá trị mới của lao động sống so với giá trị cũ chuyển dịch của máy móc.",
        },
        {
          text: "Thế thì chúng tôi sẽ phá hủy AI để giữ lấy công việc của mình!",
          type: "wrong",
          enemyDmg: -10,
          playerDmg: 30,
          response:
            "Đây là tư duy của phong trào Luddite thế kỷ 19 – đập phá máy móc. Nó không giải quyết được vấn đề và chỉ làm bạn mất đi sự ủng hộ.",
        },
      ],
    },
  ],
};

// ═══════════════════ SCENE DATA ═══════════════════

const SCENES: Record<SceneId, Scene> = {
  prologue: {
    id: "prologue",
    title: "Lệnh Chuyển Ca Thứ",
    bgAccent: "var(--primary)",
    setting: "Nhà máy Sáng Nam · Bình Dương · 03/2025",
    narrative:
      'Ca sáng đầu tuần bắt đầu như mọi ngày, cho đến khi bảng thông báo điện tử nhấp nháy dòng chữ: "Dự án Loom-X sẽ được kích hoạt sau 72 giờ". Từ khối văn phòng kinh doanh đến tổ máy số 3, ai cũng đoán rằng đây là đợt tái cấu trúc lớn nhất của nhà máy trong 20 năm. Bạn vừa là nhân sự mới, vừa là người duy nhất chưa bị cuốn vào tâm trạng "cũ làm đã rồi tinh sau".',
    npc: {
      name: "Ba Hoa",
      emoji: "👩‍💼",
      role: "Trưởng phòng nhân sự",
      dialogue:
        "Tôi chưa thể nói hết. Chỉ biết rằng sau 72 giờ, dây chuyền mới sẽ vào. Nếu muốn tồn tại ở Sáng Nam, mỗi người phải tự chọn cách đứng trong cuộc thay đổi này.",
    },
    choices: [
      {
        text: "🎓 Bạn xin danh sách vị trí sẽ bị ảnh hưởng bởi Loom-X, muốn biết quan hệ giữa năng suất mới và số phận lao động cũ.",
        feedback:
          "Ba Hoa không trả lời thẳng, nhưng sự im lặng của bà nói lên rất nhiều. Bạn đã buộc nhà máy phải lộ diện: đây không chỉ là đầu tư máy móc, mà là sắp xếp lại ai được ở lại và ai bị đẩy ra ngoài.",
        effect: { knowledge: 10, social: 10 },
        next: "baotu",
        conceptTag: "Điều tra tái cấu trúc",
        requirement: { stat: "knowledge", min: 50 },
        roleBonus: "student",
      },
      {
        text: "👷 Bạn không hỏi vòng vo, mà yêu cầu nói rõ trước mặt cả tổ máy: robot vào thì công nhân nào sẽ mất cả, công nhân nào bị ép tăng tốc.",
        feedback:
          "Mấy người đứng cạnh đó quay sang nhìn bạn. Lần đầu tiên trong buổi sáng, nỗi lo trong xưởng được nói ra bằng giọng nói của một con người, không phải bằng tin đồn hành lang.",
        effect: { social: 12, willpower: 5 },
        next: "baotu",
        conceptTag: "Lên tiếng tại xưởng",
        roleBonus: "worker",
      },
      {
        text: "💻 Bạn xin quyền xem bản mô phỏng của Loom-X, quyết định phải hiểu hệ thống trước khi hệ thống quyết định số phận của mình.",
        feedback:
          "Ba Hoa bất ngờ vì bạn biết cách đặt câu hỏi đúng. Bạn được hẹn gặp phòng kỹ thuật vào cuối ca, và lần đầu tiên cảm thấy công nghệ có thể được giành lại từ tay giới tư bản thay vì chỉ là nguồn đe dọa.",
        effect: { knowledge: 8, wealth: 8 },
        next: "baotu",
        conceptTag: "Thâm nhập hệ thống",
        requirement: { stat: "wealth", min: 50 },
        roleBonus: "technician",
      },
      {
        text: "Bạn giữ im lặng, chọn quan sát và đi theo dòng người về tổ máy số 3.",
        feedback:
          "Bạn chưa có câu trả lời nào, nhưng không khí trong xưởng đã báo cho bạn biết: 72 giờ tới sẽ không còn là chuyện làm việc bình thường nữa.",
        effect: { willpower: 5 },
        next: "baotu",
      },
    ],
  },

  baotu: {
    id: "baotu",
    title: "Mười Lăm Phút Của Bác Tư",
    bgAccent: "var(--secondary)",
    setting: "Tổ máy số 3 · 10:15 sáng",
    narrative:
      "Bác Tư không nhìn vào màn hình thông báo, ông nhìn vào chiếc áo đang may dở. Ông nói rằng nhà máy nào cũng muốn chạy nhanh hơn, nhưng không ai tự hỏi cái gì tạo nên giá trị của chiếc áo trước khi robot xuất hiện. Xung quanh, máy may vẫn gõ nhịp đều, như thể cả xưởng đang chờ một ai đó nói thành lời điều ai cũng cảm được mà chưa ai gọi đúng tên.",
    npc: {
      name: "Bác Tư",
      emoji: "👴",
      role: "Thợ may · 20 năm kinh nghiệm",
      dialogue:
        "Người ta nhìn 15 phút của Bác như 15 phút riêng của một ông già. Không phải. Đây là thời gian lao động xã hội kết tinh trong từng đường chỉ. Nếu mai dây chuyền nhanh gấp đôi, câu hỏi không chỉ là ai nhanh hơn, mà là ai đang tạo ra giá trị mới.",
    },
    choices: [
      {
        text: "🎓 Bạn dùng bữa nghỉ ngắn để biến tổ máy thành một 'lớp học hiện trường', giải thích cho mọi người hai mặt của lao động ngay trên chiếc áo Bác Tư đang may.",
        feedback:
          "Người trong tổ bắt đầu dừng lại nghe thay vì coi đây là lời than vãn của người già. Bạn không đọc bài, bạn biến lý luận thành thứ mà ai cũng nhìn thấy trên bàn máy.",
        effect: { knowledge: 25, social: 8, gem: "Hai Mặt Lao Động" },
        next: "robots",
        conceptTag: "Lao động hai mặt",
        requirement: { stat: "knowledge", min: 40 },
        roleBonus: "student",
      },
      {
        text: "💻 Bạn mở bảng mô phỏng năng suất, chỉ cho Bác Tư và cả tổ thấy rằng tốc độ máy tăng có thể đẩy giá trị áo xuống và tiền công vào thế bị đóng băng.",
        feedback:
          "Bác Tư nhìn màn hình rất lâu rồi chỉ nói một câu: 'Vậy là máy nhanh hơn chưa chắc đời mình khá hơn.' Từ khoảnh khắc đó, công nghệ không còn là phép màu, mà trở thành bài toán quyền lực.",
        effect: { knowledge: 18, wealth: 8, gem: "Năng Suất & Giá Trị" },
        next: "robots",
        conceptTag: "Đồ thị năng suất",
        requirement: { stat: "wealth", min: 45 },
        roleBonus: "technician",
      },
      {
        text: "👷 Bạn nói thẳng với cả tổ: nếu mình không hiểu mình đang tạo ra giá trị gì, ngày Loom-X bật lên thì mình sẽ bị thay thế mà không kịp mở miệng.",
        feedback:
          "Không ai cười câu nói đó. Bác Tư tắt máy trong vài giây, và sự im lặng ấy có sức nặng hơn mọi bài phát biểu. Tổ máy lần đầu tiên nhìn nỗi sợ của mình như một vấn đề chung.",
        effect: {
          willpower: 20,
          social: 15,
          knowledge: 5,
          gem: "Lao Động Sống & Chết",
        },
        next: "robots",
        conceptTag: "Tinh thần tổ máy",
        requirement: { stat: "willpower", min: 35 },
        roleBonus: "worker",
      },
      {
        text: "Bạn chọn nghe và ghi nhớ, tạm thời chưa đứng vào cuộc tranh luận đang âm lên trong tổ.",
        feedback:
          'Bác Tư không ép bạn nói gì. Ông chỉ bảo: "Đừng để người ta viết nghĩa của công việc thay cho mình." Câu nói ấy bám theo bạn cả ngày.',
        effect: { wealth: 5 },
        next: "robots",
      },
    ],
  },

  robots: {
    id: "robots",
    title: "72 Giờ Sau",
    bgAccent: "var(--destructive)",
    setting: "Sàn nhà máy · 3 ngày sau",
    narrative:
      "Loom-X được hạ xuống giữa sàn như một nghi lễ. Ban giám đốc đứng trên bậc tam cấp gọi đây là 'bước nhảy năng suất'. Công nhân đứng thành từng cụm, người chụp ảnh, người im lặng, người đã tính đường rút. Chị Mai không nhìn robot, chỉ nhìn biểu cảm của những người đang cần một câu trả lời để quyết định có nên tiếp tục ở lại hay không.",
    npc: {
      name: "Chị Mai",
      emoji: "👩‍🦱",
      role: "Trưởng công đoàn",
      dialogue:
        "Máy móc có thể mới, nhưng câu hỏi cũ vẫn còn đó: ai hưởng thành quả, ai trả giá, ai bị đẩy thành dư ra bên lề? Nếu hôm nay mình nói sai, cả nhà máy sẽ tin rằng tự động hóa là định mệnh.",
    },
    choices: [
      {
        text: "🎓 Bạn đứng giữa sàn và vẽ ra nghịch lý của Chương 6: từng doanh nghiệp thay lao động sống để tranh lợi, nhưng cả hệ thống lại tự cắt vào nguồn tạo giá trị của nó.",
        feedback:
          "Người nghe không còn chỉ sợ robot và bàn tán giá máy nữa. Họ bắt đầu hỏi một câu khác: nếu lợi nhuận được bảo bằng việc cắt bỏ lao động sống, đến lúc nào chính hệ thống sẽ khát giá trị mới?",
        effect: { knowledge: 30, social: 25, gem: "Nghịch Lý Tự Động Hóa" },
        next: "overtime",
        conceptTag: "Nghịch lý hệ thống",
        requirement: { stat: "knowledge", min: 55 },
        roleBonus: "student",
      },
      {
        text: "💻 Bạn tiếp cận khu kỹ thuật, nói rõ mình muốn nắm quyền vận hành Loom-X trước khi dây chuyền mới bị khóa kín bởi một nhóm nhỏ.",
        feedback:
          "Kỹ sư bên cung cấp ngoài nhìn bạn bằng ánh mắt dè phòng, nhưng phải thừa nhận bạn hiểu cách đặt vấn đề. Bạn không xin được an phận an toàn, bạn đang tranh quyền bước vào nơi công nghệ được dùng để quyết định số phận người khác.",
        effect: { wealth: 25, knowledge: 12, social: 5 },
        next: "overtime",
        conceptTag: "Giành quyền hiểu máy",
        requirement: { stat: "wealth", min: 50 },
        roleBonus: "technician",
      },
      {
        text: "👷 Bạn cùng Chị Mai phát động bản ký tên ngay tại sàn, đòi doanh nghiệp cam kết đào tạo lại và không sa thải vô điều kiện sau khi Loom-X vào chạy.",
        feedback:
          "Bản ký tên truyền tay nhanh hơn cả thông báo nội bộ. Đến lúc giám đốc nhận ra, vấn đề không còn nằm ở máy móc nữa, mà đã trở thành câu hỏi công khai về việc ai phải gánh hậu quả của tự động hóa.",
        effect: {
          willpower: 30,
          social: 20,
          knowledge: 5,
          gem: "Đoàn Kết Công Nhân",
        },
        next: "overtime",
        conceptTag: "Ký tên tập thể",
        requirement: { stat: "willpower", min: 50 },
        roleBonus: "worker",
      },
      {
        text: "Bạn quyết định lùi lại, theo dõi xem sàn nhà máy sẽ nghiêng về Loom-X theo hướng nào trước khi chọn phe.",
        feedback:
          "Lùi lại giúp bạn thấy rõ hơn một điều: sự im lặng trong nhà máy không trung lập, nó đang nghiêng về phía nào có can đảm gọi tên bản chất của cuộc đổi đời này.",
        effect: { willpower: -5, social: 5 },
        next: "overtime",
      },
    ],
  },

  overtime: {
    id: "overtime",
    title: "Bảng Hiệu Suất Đỏ",
    bgAccent: "var(--destructive)",
    setting: "Ca đêm thử nghiệm · 20:00",
    narrative:
      'Ngày đầu Loom-X chạy thử, đến ca đêm bảng năng suất mới đã được treo khắp xưởng. Camera AI đo từng nhát tay, từng lần dừng lại, từng giây trao đổi. Tiếng loa liên tục gọi: "Bám sát nhịp máy mới". Bác Tư run tay. Một chị trong tổ bắt đầu khóc vì không theo kịp định mức vừa được cập nhật cách đó 10 phút.',
    npc: {
      name: "Giám sát viên",
      emoji: "🧐",
      role: "Quản lý ca đêm",
      dialogue:
        "Muốn giữ đơn hàng thì phải theo kịp hệ thống. Đây không phải ép buộc, đây là tiêu chuẩn mới. Không theo kịp thì tự mình rời khỏi dây chuyền.",
    },
    choices: [
      {
        text: "🎓 Bạn phân tích ngay tại bảng chỉ tiêu: đây là cách hút giá trị thặng dư tuyệt đối bằng việc kéo dài và nén chặt cường độ lao động.",
        feedback:
          "Khi lý luận được gọi đúng tên, sự uất ức trong xưởng thôi không còn mơ hồ. Mọi người bắt đầu thấy rõ rằng đây không phải vấn đề 'yêu nghề' hay 'cố gắng thêm chút', mà là một cơ chế bóc lột đang được hợp thức hóa bằng dữ liệu.",
        effect: { knowledge: 20, willpower: 15, gem: "Thặng Dư Tuyệt Đối" },
        next: "reserve_army",
        conceptTag: "Bảng tên bóc lột",
        roleBonus: "student",
      },
      {
        text: "👷 Bạn ra hiệu cho cả tổ đồng loạt hạ tốc độ và chỉ làm đúng quy trình an toàn, biến ca đêm thành một cuộc cân sức có tổ chức.",
        feedback:
          "Quản lý ca đêm có thể đe dọa từng người, nhưng không thể đe dọa cả một tổ đang đồng nhịp với nhau. Trong lần đầu tiên, Loom-X phải chạy theo người thay vì người chạy theo Loom-X.",
        effect: { social: 20, willpower: 20, gem: "Đấu Tranh Giai Cấp" },
        next: "reserve_army",
        conceptTag: "Chậm lại để sống",
        requirement: { stat: "willpower", min: 45 },
        roleBonus: "worker",
      },
      {
        text: "💻 Bạn đột nhập vào cấu hình phân luồng, chuyển Loom-X sang ưu tiên cân bằng tải trọng thay vì dồn sức ép lên nhóm người yếu nhất.",
        feedback:
          "Hệ thống không bao giờ trung lập. Nó phân bổ áp lực theo cách được lập trình. Khi bạn đổi tham số, cả tổ thắng được một khoảng thở. Bạn vừa chứng minh công nghệ có thể bị giật lại từ tay những ai dùng nó để ép người.",
        effect: { knowledge: 15, wealth: 20, gem: "AI Nhân Văn" },
        next: "reserve_army",
        conceptTag: "Giật lại tham số",
        requirement: { stat: "wealth", min: 40 },
        roleBonus: "technician",
      },
    ],
  },

  reserve_army: {
    id: "reserve_army",
    title: "Danh Sách Cắt Giảm",
    bgAccent: "var(--muted)",
    setting: "Cổng nhà máy · chiều mưa",
    narrative:
      "Ba ngày sau ca thử nghiệm, một file excel in ra dán đầy trên bảng thông báo. 30 tên bị đưa vào nhóm 'tạm dừng vị trí'. Không ai nói từ sa thải, nhưng ai cũng hiểu. Anh Hùng đứng trong mưa, tay giữ túi đồ nghề, mắt không nhìn vào ai. Loom-X vẫn chạy đều phía sau, rất ổn định, rất đẹp, rất lạnh.",
    npc: {
      name: "Anh Hùng",
      emoji: "🧑‍🔧",
      role: "Thợ cắt bị cắt vị trí",
      dialogue:
        "Tôi làm ở đây 10 năm. Bây giờ họ bảo hệ thống mới không còn cần nhiều người như cũ. Nếu tôi thành người dư thừa, vậy 10 năm của tôi tính là gì?",
    },
    choices: [
      {
        text: "🎓 Bạn nói rõ với Anh Hùng: đây chính là đội quân dự bị công nghiệp mà Mác mô tả, được tạo ra để làm sức ép xuống tiền công và giữ người đang ở lại trong nỗi sợ.",
        feedback:
          "Anh Hùng lặng im rất lâu, rồi lần đầu tiên hỏi tiếp thay vì buông xuôi. Khi bi kịch được đặt đúng tên, nó không còn giảm giá trị con người thành lỗi tự trách nữa.",
        effect: { knowledge: 25, social: 10, gem: "Đội Quân Dự Bị" },
        next: "crossroads",
        conceptTag: "Gọi tên cơ chế",
        roleBonus: "student",
      },
      {
        text: "👷 Bạn không để mọi người tan ra. Bạn kêu những người bị cắt vị trí ở lại và bàn ý tưởng lập xưởng chung của chính họ.",
        feedback:
          "Ý tưởng nghe điên rồ, nhưng trong giây phút khủng hoảng nó là thứ đầu tiên không đến từ lòng thương hại. Bạn trao lại cho họ một khả năng: không chỉ đi xin cho mình được dùng lại, mà có thể tự tổ chức lại công việc.",
        effect: { willpower: 25, social: 25, gem: "Hợp Tác Xã Số" },
        next: "crossroads",
        conceptTag: "Tự tổ chức lại lao động",
        requirement: { stat: "social", min: 40 },
        roleBonus: "worker",
      },
      {
        text: "💻 Bạn ngồi ngay xuống thềm cột, mở laptop và tạo một lộ trình học cấp tốc để biến nhóm bị cắt giảm thành nhóm vận hành và bảo trì mới.",
        feedback:
          "Không phải ai cũng lập tức tin, nhưng ai cũng đứng lại nhìn. Trong màn mưa, màn hình laptop của bạn là thứ duy nhất phát ra ánh sáng khác với bảng thông báo cắt giảm: ánh sáng của hướng đi.",
        effect: { wealth: -10, social: 30, knowledge: 15 },
        next: "crossroads",
        conceptTag: "Chuyển lao động",
        roleBonus: "technician",
      },
    ],
  },

  crossroads: {
    id: "crossroads",
    title: "Đêm Mất Điện",
    bgAccent: "var(--secondary)",
    setting: "Quán cà phê trước cổng khu công nghiệp · 23:40",
    narrative:
      "Đêm đó, cả khu mất điện trong 15 phút vì quá tải. Loom-X tắt máy, nhà máy tối đen, và lần đầu tiên trong tuần cả hệ thống thần thánh kia đứng im hoàn toàn. Bạn ngồi đối diện GS. Hùng, người vừa từ Hà Nội vào để gặp bạn sau khi nghe về cuộc biến động ở Sáng Nam. Ông nói đêm mất điện là lúc để nhìn thấy một điều đơn giản: máy móc không tự viết ra tương lai, con người mới làm việc đó.",
    npc: {
      name: "GS. Hùng",
      emoji: "👨‍🏫",
      role: "Giảng viên kinh tế chính trị",
      dialogue:
        "Em đã thấy tận mắt tương quan giữa lao động sống, máy móc và quyền lực. Bây giờ em chọn cách can thiệp vào lịch sử này: tổ chức lại quan hệ sản xuất, nâng cấp lao động, hay dựng mô hình sở hữu mới để đảo nghịch cuộc chơi?",
    },
    choices: [
      {
        text: "🤝 Bạn quyết định đi theo con đường tổ chức và đàm phán, biến nỗi sợ Loom-X thành sức ép chính trị của người lao động.",
        feedback:
          "GS. Hùng gập sổ. Ông không khen, chỉ nói: con đường này cần trí nhớ, kỷ luật và một tập thể không tan ra khi bị đe dọa.",
        effect: { willpower: 10, social: 10 },
        next: "path_a1",
      },
      {
        text: "💻 Bạn quyết định lao vào học sâu hệ thống, vì nếu không nắm được công nghệ thì mãi mãi chỉ theo sau nó.",
        feedback:
          "GS. Hùng nhắc bạn một câu của Mác về lao động phức tạp. Bạn nhận ra học không còn là chuyện thoát thân, mà là một mặt trận mới của quyền lực lao động.",
        effect: { knowledge: 10, wealth: 10 },
        next: "path_b1",
      },
      {
        text: "🌱 Bạn quyết định thử một thứ nguy hiểm hơn: lập mô hình công nhân đồng sở hữu máy móc thay vì xin được đối xử nhẹ tay hơn.",
        feedback:
          "GS. Hùng ngồi im rất lâu rồi mới cười. Ông bảo đây là lựa chọn khó nhất, vì nó không sửa bề mặt của hệ thống mà đụng chạm vào cấu trúc sở hữu.",
        effect: { knowledge: 5, social: 15, willpower: 5 },
        next: "path_c1",
      },
    ],
  },

  path_a1: {
    id: "path_a1",
    title: "Mặt Trận Thương Lượng",
    bgAccent: "var(--primary)",
    setting: "Văn phòng liên đoàn lao động số · 2026",
    narrative:
      "Bạn trở thành một trong những người lập hồ sơ cho các vụ tái cấu trúc tự động hóa. Ngày nào bạn cũng gặp công nhân mất việc, nhóm kỹ sư bị bổ sung trách nhiệm mà không tăng lương, và doanh nghiệp nói về năng suất như một bổn phận chứ không phải lựa chọn. Hồ sơ của Sáng Nam trở thành vụ đầu tiên được đưa lên cấp quốc gia.",
    npc: {
      name: "Chị Mai",
      emoji: "👩‍🦱",
      role: "Đồng nghiệp tổ chức",
      dialogue:
        'Nếu chỉ xin "giữ việc", mình sẽ thua. Điều khoản phải đánh thẳng vào nơi phát sinh lợi ích từ Loom-X: doanh nghiệp phải trích một phần lợi nhuận tăng thêm cho quỹ chuyển đổi lao động.',
    },
    choices: [
      {
        text: "Bạn bổ sung cơ chế đào tạo lại có lương 24 tháng, biến quỹ chuyển đổi thành quyền chính trị chứ không phải lòng thương hại.",
        feedback:
          "Hồ sơ không còn là bản kiến nghị xin xót, mà thành một thiết kế phân phối lại thành quả tự động hóa. Đây là lần đầu nhiều người thấy lý luận Chương 6 có thể đi thẳng vào chính sách.",
        effect: {
          knowledge: 10,
          social: 20,
          willpower: 10,
          gem: "Chính Sách Lao Động Số",
        },
        next: "path_a2",
      },
      {
        text: "Bạn chốt vào điều khoản doanh nghiệp phải thông báo sớm và công khai tác động lao động trước mỗi đợt tự động hóa lớn.",
        feedback:
          "Không hoành tráng bằng quỹ chuyển đổi, nhưng điều khoản này đập vỡ vũ khí mạnh nhất của doanh nghiệp: sự bất ngờ. Người lao động có thời gian để tổ chức lại mình.",
        effect: { willpower: 15, social: 15 },
        next: "path_a2",
      },
    ],
  },

  path_a2: {
    id: "path_a2",
    title: "Phiên Điều Trần Công Khai",
    bgAccent: "var(--primary)",
    setting: "Hội trường điều trần lao động số · Hà Nội · 2030",
    narrative:
      "Hồ sơ Sáng Nam trở thành tấm gương cho hàng trăm doanh nghiệp đang tự động hóa. Bạn đứng trước hội đồng điều trần, phía sau là công nhân, phía đối diện là đại diện các tập đoàn nói rằng công nghệ sẽ tự sửa tất cả. Ba phút cuối cùng thuộc về bạn.",
    npc: {
      name: "Chủ tọa",
      emoji: "🏛️",
      role: "Chủ tịch phiên điều trần",
      dialogue:
        "Xin kết luận rõ: trong kỷ nguyên AI, nhà nước phải bảo vệ cái gì trước tiên - tốc độ đầu tư hay quyền tồn tại của người lao động?",
    },
    choices: [
      {
        text: "Bạn khẳng định AI và robot là tư liệu sản xuất mới, nên người lao động phải có quyền được thông tin, được đàm phán và được hưởng một phần thành quả.",
        feedback:
          "Hội trường đáp lại bằng tiếng vỗ tay hiếm hoi trong một phiên điều trần đầy tính toán kỹ thuật. Bạn không xin cho người lao động một chỗ đứng, bạn buộc hệ thống phải thừa nhận họ là chủ thể chính trị của quá trình chuyển đổi.",
        effect: {
          social: 30,
          knowledge: 10,
          willpower: 10,
          gem: "Kiến Tạo Lịch Sử",
        },
        next: "ending_a",
      },
      {
        text: "Bạn kết lại bằng một câu đơn giản: không ai được bị biến thành phần hao mòn của tự động hóa.",
        feedback:
          "Câu nói ngắn hơn nhưng đánh thẳng vào điều cả hội trường đang né tránh. Khi phiên bỏ phiếu kết thúc, một khung pháp lý mới mở ra cho hàng triệu lao động.",
        effect: { social: 25, willpower: 20, gem: "Kiến Tạo Lịch Sử" },
        next: "ending_a",
      },
    ],
  },

  path_b1: {
    id: "path_b1",
    title: "Phòng Điều Phối Thuật Toán",
    bgAccent: "var(--accent)",
    setting: "Chương trình tái đào tạo kỹ sư hệ thống · 2026",
    narrative:
      "Bạn rời Sáng Nam một thời gian để lao vào một khóa học khác thường: không dạy bạn cách code nhanh nhất, mà dạy cách đọc hệ thống sản xuất như đọc một cấu trúc quyền lực. Bạn học machine learning, hệ thống tối ưu, logistics và cả kinh tế chính trị. Mỗi lần mô hình hóa một dây chuyền, bạn lại nhớ tới khuôn mặt người bị gọi tên trong bảng cắt giảm năm nào.",
    npc: {
      name: "Thầy Khoa",
      emoji: "👨‍💻",
      role: "Hướng dẫn kỹ thuật",
      dialogue:
        "Lao động phức tạp tạo ra giá trị cao hơn không có nghĩa nó vô can. Vấn đề là em dùng trí tuệ kỹ thuật để phục vụ cấu trúc nào: cắt giảm con người hay mở đường cho họ sống được với công nghệ?",
    },
    choices: [
      {
        text: "Bạn xây dựng hệ thống AI phục vụ chuyển nghề cho công nhân, ưu tiên ghép kỹ năng hiện có với lộ trình học ngắn nhất để vào việc mới.",
        feedback:
          "Đề tài của bạn làm thay đổi không khí cả lớp. Đây không còn là bài tập tối ưu hóa máy, mà là bài toán làm sao để lao động sống không bị vứt ra ngoài mỗi lần công nghệ nhảy vọt.",
        effect: {
          knowledge: 20,
          social: 15,
          wealth: 10,
          gem: "Lao Động Phức Tạp",
        },
        next: "path_b2",
        conceptTag: "AI chuyển nghề",
      },
      {
        text: "Bạn chọn đi sâu vào AI tối ưu sản xuất, muốn nắm tận gốc công cụ mà doanh nghiệp đang dùng để tái cấu trúc xưởng may.",
        feedback:
          "Lựa chọn này không vô tội, nhưng nó bắt bạn nhìn thẳng vào nghịch lý: càng giỏi tối ưu, bạn càng phải đối diện với câu hỏi mình đang tối ưu cho ai.",
        effect: { wealth: 25, knowledge: 15 },
        next: "path_b2",
      },
    ],
  },

  path_b2: {
    id: "path_b2",
    title: "Mạng Chuyển Nghề VietTransition",
    bgAccent: "var(--accent)",
    setting: "Phòng nghiên cứu ứng dụng lao động số · 2030",
    narrative:
      "Bốn năm sau, bạn là người đứng đầu một dự án AI không nhằm thay người nhanh hơn, mà giúp người lao động tìm đường qua sóng shock tự động hóa. VietTransition không tính ai 'dư thừa'; hệ thống tính những kỹ năng có thể được chuyển hóa, những khu vực đang khát nhân lực, và những lộ trình học ngắn nhất để đi tiếp.",
    npc: {
      name: "GĐ dự án",
      emoji: "🔬",
      role: "Hội đồng triển khai",
      dialogue:
        "Đây là thời điểm quyết định. Nếu mở hệ thống ra, xã hội cùng hưởng lợi nhưng quy tắc kinh doanh của dự án sẽ thay đổi. Nếu đóng nó lại, em sẽ có nguồn lực để mở rộng nhanh hơn.",
    },
    choices: [
      {
        text: "Bạn mở mã nguồn và công bố bộ tiêu chuẩn đánh giá để địa phương, công đoàn và trường nghề cùng có thể phát triển.",
        feedback:
          "Quyết định này làm dự án không còn thuộc riêng một tổ chức. Ảnh hưởng của nó lan nhanh hơn thu nhập cá nhân của bạn, và lần đầu tiên một hệ thống AI lao động được xem là hạ tầng chung.",
        effect: {
          social: 25,
          knowledge: 10,
          wealth: -10,
          gem: "AI Vì Cộng Đồng",
        },
        next: "ending_b",
      },
      {
        text: "Bạn thương mại hóa có kiểm soát để mở rộng nhanh, giữ nhóm trung tâm đủ nguồn lực cập nhật hệ thống liên tục.",
        feedback:
          "Bạn chấp nhận đi trên một dây cân bằng mong manh giữa tác động xã hội và sức ép thị trường. Dưới cách nào, dự án vẫn đặt lại câu hỏi ban đầu của Sáng Nam cho cả nước.",
        effect: { wealth: 20, knowledge: 10, social: 10 },
        next: "ending_b",
      },
    ],
  },

  path_c1: {
    id: "path_c1",
    title: "Xưởng Sở Hữu Chung",
    bgAccent: "var(--secondary)",
    setting: "Nhà kho cũ tại Thủ Dầu Một · 2026",
    narrative:
      "Bạn quay lại những người bị đẩy ra khỏi Sáng Nam và đề xuất một vấn đề mà lúc đầu nghe như chuyện tưởng tượng: nếu tự động hóa đã đến, tại sao công nhân không cùng nhau sở hữu nó? Sau ba tháng gom vốn, vay quỹ hỗ trợ và tận dụng một nhà kho cũ, nhóm của bạn lập được xưởng thử nghiệm đầu tiên với ba cụm máy bán tự động và một quy chế tự quản.",
    npc: {
      name: "Anh Bình",
      emoji: "🤝",
      role: "Thành viên sáng lập",
      dialogue:
        "Lần đầu tiên tôi không sợ robot nữa. Tôi sợ mình sẽ trở về cách cũ, để người khác sở hữu máy, còn mình chỉ được phép sống nếu hợp với tốc độ của nó.",
    },
    choices: [
      {
        text: "Bạn chốt nguyên tắc mỗi thành viên một phiếu, lợi nhuận chia trước tiên theo lao động đóng góp và quỹ dự phòng chung.",
        feedback:
          "Xưởng nhỏ, máy ít, nhưng không khí khác hẳn. Mọi quyết định về máy móc giờ đều quay lại câu hỏi ai được hưởng thành quả. Đây là lúc lý luận về sở hữu trở thành quy tắc vận hành mỗi ngày.",
        effect: {
          social: 20,
          knowledge: 15,
          willpower: 10,
          gem: "Dân Chủ Công Nghiệp",
        },
        next: "path_c2",
        conceptTag: "Đồng sở hữu máy móc",
      },
      {
        text: "Bạn ưu tiên tái đầu tư mạnh vào máy và đào tạo, muốn chứng minh mô hình công nhân sở hữu vẫn có thể lớn nhanh.",
        feedback:
          "Áp lực lớn hơn, nhưng nó giúp mô hình của bạn thoát khỏi thân phận biểu tượng. Mỗi đơn hàng mới là một lần chứng minh rằng vấn đề không phải robot hay không robot, mà là ai nắm quyền đối với robot.",
        effect: { wealth: 15, social: 15, knowledge: 10 },
        next: "path_c2",
      },
    ],
  },

  path_c2: {
    id: "path_c2",
    title: "Liên Minh Dây Chuyền",
    bgAccent: "var(--secondary)",
    setting: "Hội nghị liên kết hợp tác xã số · 2030",
    narrative:
      "Bốn năm sau, mô hình của bạn không còn là một xưởng thử nghiệm. Nhiều nhóm lao động bị cắt giảm từ các khu công nghiệp khác đã nhân bản nó thành mạng lưới sản xuất mới. Các tổ hợp tác xã chia sẻ máy, dữ liệu đơn hàng, chương trình đào tạo và cả quỹ phúc lợi. Giờ đây, vấn đề không còn là có tồn tại được hay không, mà là có giữ được bản chất khi mở rộng hay không.",
    npc: {
      name: "Đại diện quỹ đầu tư phát triển",
      emoji: "🌏",
      role: "Nhà đầu tư quốc tế",
      dialogue:
        "Nếu chúng tôi bơm vốn, quy mô của mô hình này sẽ tăng vọt. Nhưng vốn lớn luôn đi kèm quyền ảnh hưởng. Các anh chị sẵn sàng giữ ranh giới đến đâu?",
    },
    choices: [
      {
        text: "Bạn nhận vốn chỉ nếu điều lệ bắt buộc giữ quyền phiếu của công nhân và giới hạn tỷ lệ can thiệp của nhà đầu tư.",
        feedback:
          "Cuộc đàm phán kéo dài đến nửa đêm. Khi thỏa thuận được ký, mô hình của bạn không chỉ lớn lên mà còn đặt được một tiền lệ: vốn có thể vào, nhưng quyền làm chủ của lao động không được bị pha loãng.",
        effect: {
          social: 25,
          wealth: 15,
          knowledge: 10,
          gem: "Kinh Tế HTX Số",
        },
        next: "ending_c",
      },
      {
        text: "Bạn từ chối vốn lớn, chọn phát triển chậm hơn để giữ mô hình hoàn toàn độc lập và do công nhân tự quyết.",
        feedback:
          "Quyết định này làm nhiều người sốt ruột, nhưng nó giữ cho liên minh của bạn một nhân cách rõ ràng. Tốc độ chậm hơn, nhưng hướng đi không bị đổi chủ.",
        effect: { willpower: 20, social: 20, knowledge: 5 },
        next: "ending_c",
      },
    ],
  },
};

// ═══════════════════ ENDINGS DATA ═══════════════════

const ENDINGS: Record<
  EndingId,
  {
    title: string;
    emoji: string;
    color: string;
    year: string;
    narrative: string;
    marxLesson: string;
    highlightStats: string[];
  }
> = {
  ending_a: {
    title: "Chiến Sĩ Lao Động Số",
    emoji: "✊",
    color: "var(--primary)",
    year: "2030",
    narrative:
      "Luật Lao Động Số được thông qua với 78% phiếu thuận. Hơn 2 triệu công nhân Việt Nam được bảo vệ trong quá trình chuyển đổi số. Quỹ Robot Hóa mỗi năm đào tạo lại 300,000 người. Tên bạn được ghi nhận trong lịch sử phong trào lao động Việt Nam thế kỷ 21.",
    marxLesson:
      "Mác dạy: mâu thuẫn giữa lực lượng sản xuất mới (AI, robot) và quan hệ sản xuất cũ tất yếu đòi hỏi điều chỉnh có tổ chức. Bạn đã là người kiến tạo sự điều chỉnh đó theo hướng bảo vệ người lao động.",
    highlightStats: ["social", "willpower"],
  },
  ending_b: {
    title: "Kỹ Sư Tương Lai",
    emoji: "🔬",
    color: "var(--accent)",
    year: "2030",
    narrative:
      "VietTransition AI – sản phẩm Made in Vietnam của bạn – đã giúp 500,000 công nhân tìm được việc làm mới trong thời đại số. Bạn đã chứng minh: lao động trí tuệ Việt Nam có thể tạo ra giá trị tầm quốc tế.",
    marxLesson:
      "Lao động phức tạp của bạn – như Mác phân tích – tạo ra giá trị gấp nhiều lần lao động giản đơn trong cùng thời gian. Kỹ năng AI là dạng lao động trừu tượng cao cấp nhất của thế kỷ 21.",
    highlightStats: ["knowledge", "wealth"],
  },
  ending_c: {
    title: "Nhà Kiến Tạo Xã Hội",
    emoji: "🌱",
    color: "var(--secondary)",
    year: "2030",
    narrative:
      "SángTạo Coop và 44 HTX số liên minh là mô hình kinh tế mới mẻ: 4,500 công nhân đồng thời là chủ sở hữu robot và AI. Thế giới đang học hỏi từ mô hình Việt Nam.",
    marxLesson:
      "Bạn đã giải quyết mâu thuẫn cơ bản Mác chỉ ra: khi công nhân SỞ HỮU tư liệu sản xuất (robot, AI), mâu thuẫn giữa lao động và tư bản được hóa giải. Đây là hướng đi XHCN thời đại số.",
    highlightStats: ["social", "knowledge"],
  },
  ending_scholar: {
    title: "Học Giả Mác Thời Đại Số",
    emoji: "📚",
    color: "var(--border)",
    year: "2030",
    narrative:
      'Luận án tiến sĩ "Lý Luận Giá Trị Mác và Trí Tuệ Nhân Tạo: Phân Tích Biện Chứng" của bạn được xuất bản ở 12 quốc gia và trích dẫn trong 500 công trình học thuật quốc tế.',
    marxLesson:
      "Lý luận Mác không lỗi thời – nó cần được phát triển và vận dụng sáng tạo vào thực tiễn mới. Bạn đã đóng góp vào sự phát triển đó cho thế hệ sau.",
    highlightStats: ["knowledge"],
  },
};

// ═══════════════════ HELPERS ═══════════════════

const applyEffect = (stats: Stats, effect: StatEffect): Stats => ({
  knowledge: Math.min(
    100,
    Math.max(0, stats.knowledge + (effect.knowledge || 0)),
  ),
  willpower: Math.min(
    100,
    Math.max(0, stats.willpower + (effect.willpower || 0)),
  ),
  wealth: Math.min(100, Math.max(0, stats.wealth + (effect.wealth || 0))),
  social: Math.min(100, Math.max(0, stats.social + (effect.social || 0))),
});

const determineEnding = (char: Character): EndingId => {
  const { stats } = char;
  if (stats.knowledge >= 80) return "ending_scholar";
  if (stats.social >= 70 && stats.willpower >= 60) return "ending_a";
  if (stats.knowledge >= 60 && stats.wealth >= 55) return "ending_b";
  if (stats.social >= 65 && stats.knowledge >= 50) return "ending_c";

  // Fallback logic - check which stat is actually highest
  const maxStat = Math.max(
    stats.knowledge,
    stats.willpower,
    stats.wealth,
    stats.social,
  );

  // Count how many stats have the max value
  const maxStats = [];
  if (stats.knowledge === maxStat) maxStats.push("knowledge");
  if (stats.willpower === maxStat) maxStats.push("willpower");
  if (stats.wealth === maxStat) maxStats.push("wealth");
  if (stats.social === maxStat) maxStats.push("social");

  // If there's a tie, prioritize based on character class or specific order
  if (maxStats.length === 1) {
    // Single highest stat
    if (maxStats[0] === "knowledge") return "ending_b";
    if (maxStats[0] === "willpower" || maxStats[0] === "social")
      return "ending_a";
    return "ending_c";
  } else {
    // Tie-breaking logic
    if (maxStats.includes("willpower") || maxStats.includes("social"))
      return "ending_a";
    if (maxStats.includes("knowledge")) return "ending_b";
    return "ending_c";
  }
};

const checkAchievements = (char: Character, sceneId: SceneId): string[] => {
  const newAchievements: string[] = [];
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (
      !char.achievements.includes(achievement.id) &&
      achievement.condition(char, sceneId)
    ) {
      newAchievements.push(achievement.id);
    }
  });
  return newAchievements;
};

// ═══════════════════ CINEMA SCREEN ═══════════════════

function ChallengeScreen({
  challenge,
  character,
  onAnswered,
}: {
  challenge: Challenge;
  character: Character;
  onAnswered: (optionIndex: number) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const roleHint = challenge.hints?.[character.characterClass];

  const handleSubmit = (index: number) => {
    setSelectedOption(index);
    setAnswered(true);
    setTimeout(() => onAnswered(index), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(88, 28, 135, 0.82) 50%, rgba(88, 86, 214, 0.18) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          width: "100%",
        }}
      >
        <div
          style={{
            padding: 26,
            marginBottom: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(9, 14, 27, 0.62)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: "#fbbf24",
                  letterSpacing: 2,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Bien Co Hien Truong
              </div>
              <h2
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: 28,
                  fontWeight: "900",
                  fontFamily: "var(--font-slab)",
                  lineHeight: 1.2,
                }}
              >
                {challenge.title}
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: 30 }}>{challenge.emoji}</span>
              <div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Dang nhap vai
                </div>
                <div
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  {character.classLabel}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 18,
            }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  color: "#93c5fd",
                  fontSize: 11,
                  fontWeight: "900",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Tinh huong
              </div>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {challenge.scenario}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(251, 191, 36, 0.08)",
                  border: "1px solid rgba(251, 191, 36, 0.18)",
                }}
              >
                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: 11,
                    fontWeight: "900",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Muc cuoc
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {challenge.stakes}
                </p>
              </div>

              {roleHint && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.18)",
                  }}
                >
                  <div
                    style={{
                      color: "#86efac",
                      fontSize: 11,
                      fontWeight: "900",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Loi the vai tro
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {roleHint}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: "900",
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 2,
              marginBottom: 15,
              textTransform: "uppercase",
            }}
          >
            Chon cach xu ly tinh huong
          </div>
          <h2
            style={{
              fontSize: 26,
              fontFamily: "var(--font-slab)",
              margin: 0,
              color: "white",
              fontWeight: "900",
              lineHeight: 1.35,
            }}
          >
            {challenge.question}
          </h2>
        </motion.div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 30,
          }}
        >
          {challenge.options.map((option, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => !answered && handleSubmit(i)}
              disabled={answered}
              style={{
                padding: "20px",
                background:
                  selectedOption === i
                    ? option.isCorrect
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))"
                      : "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))"
                    : "rgba(255,255,255,0.07)",
                border:
                  selectedOption === i
                    ? option.isCorrect
                      ? "1px solid rgba(34, 197, 94, 0.5)"
                      : "1px solid rgba(239, 68, 68, 0.5)"
                    : "1px solid rgba(255,255,255,0.12)",
                color: "white",
                fontSize: 16,
                fontWeight: "900",
                borderRadius: 12,
                cursor: answered ? "default" : "pointer",
                transition: "all 0.3s ease",
                textAlign: "left",
                opacity: answered && selectedOption !== i ? 0.5 : 1,
                backdropFilter: "blur(8px)",
                boxShadow: "0 16px 30px rgba(0,0,0,0.12)",
              }}
              onMouseEnter={(e: any) => {
                if (!answered) {
                  e.target.style.background = "rgba(255,255,255,0.12)";
                  e.target.style.borderColor = "rgba(255,255,255,0.24)";
                }
              }}
              onMouseLeave={(e: any) => {
                if (!answered) {
                  e.target.style.background = "rgba(255,255,255,0.07)";
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    minWidth: 30,
                    color:
                      selectedOption === i
                        ? option.isCorrect
                          ? "#86efac"
                          : "#fca5a5"
                        : "#fbbf24",
                  }}
                >
                  {selectedOption === i
                    ? option.isCorrect
                      ? "✓"
                      : "✗"
                    : i + 1}
                </span>
                <span
                  style={{
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  {option.text}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: 20,
                background: challenge.options[selectedOption].isCorrect
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                border: challenge.options[selectedOption].isCorrect
                  ? "1px solid rgba(34, 197, 94, 0.3)"
                  : "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 12,
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {challenge.options[selectedOption].feedback}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════ CINEMA SCREEN ═══════════════════

function CinemaScreen({
  endingId,
  character,
  onComplete,
}: {
  endingId: EndingId;
  character: Character;
  onComplete: () => void;
}) {
  const ending = ENDINGS[endingId];
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowSkip(true), 2000);
    const timer = setTimeout(() => onComplete(), 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const scenes = [
    {
      title: "Hành Trình Kết Thúc",
      text: `"${character.name}" đã hoàn thành hành trình của mình...`,
      duration: 2000,
    },
    {
      title: "Kết Quả",
      text: `Quyết định của bạn tạo nên sự thay đổi...`,
      duration: 2000,
    },
    {
      title: "Tương Lai",
      text: `Năm ${ending.year}, những gì bạn đã làm trở thành hiện thực...`,
      duration: 2000,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #000 0%, rgba(88, 86, 214, 0.2) 50%, #000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(88, 86, 214, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cinema content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: "center",
          zIndex: 10,
          maxWidth: 800,
        }}
      >
        {/* Large emoji */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            fontSize: 200,
            marginBottom: 40,
            filter: "drop-shadow(0 0 40px rgba(88, 86, 214, 0.5))",
          }}
        >
          {ending.emoji}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            fontSize: 56,
            fontFamily: "var(--font-slab)",
            color: "white",
            margin: "0 0 30px 0",
            fontWeight: "900",
            textShadow:
              "0 0 30px rgba(88, 86, 214, 0.5), 0 0 60px rgba(88, 86, 214, 0.3)",
            textTransform: "uppercase",
            letterSpacing: 2,
            lineHeight: 1.3,
          }}
        >
          {ending.title}
        </motion.h1>

        {/* Narrative */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 40px 0",
            fontStyle: "italic",
            lineHeight: 1.6,
            textShadow: "0 0 20px rgba(0,0,0,0.7)",
          }}
        >
          "{ending.narrative.slice(0, 150)}..."
        </motion.p>

        {/* Character info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {character.emoji}
            </div>
            <div>{character.name}</div>
          </div>
          <div style={{ fontSize: 40 }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
            <div>Năm {ending.year}</div>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 7.5, ease: "linear" }}
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, var(--primary), rgba(88, 86, 214, 0.5))",
            borderRadius: 2,
            marginBottom: 20,
          }}
        />

        {/* Skip button */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={onComplete}
              style={{
                padding: "10px 20px",
                background: "rgba(88, 86, 214, 0.1)",
                border: "1px solid rgba(88, 86, 214, 0.4)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                fontWeight: "900",
                borderRadius: 4,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e: any) => {
                e.target.style.background = "rgba(88, 86, 214, 0.2)";
                e.target.style.borderColor = "rgba(88, 86, 214, 0.6)";
                e.target.style.color = "rgba(255,255,255,0.9)";
              }}
              onMouseLeave={(e: any) => {
                e.target.style.background = "rgba(88, 86, 214, 0.1)";
                e.target.style.borderColor = "rgba(88, 86, 214, 0.4)";
                e.target.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              ⏭ Bỏ Qua
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ═══════════════════ ENDING SCREEN ═══════════════════

function StatBar({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <span
          style={{
            color: "var(--foreground)",
            opacity: 0.7,
            fontSize: 11,
            fontWeight: "bold",
          }}
        >
          {label}
        </span>
        <span
          style={{ color: "var(--primary)", fontSize: 11, fontWeight: "900" }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          height: 8,
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "var(--primary)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function CharPanel({ char }: { char: Character }) {
  return (
    <div
      className="industrial-card"
      style={{ padding: 18, position: "sticky", top: 16 }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 44, marginBottom: 6 }}>{char.emoji}</div>
        <div
          style={{
            color: "var(--primary)",
            fontWeight: "900",
            fontSize: 15,
            textTransform: "uppercase",
          }}
        >
          {char.name}
        </div>
        <div
          style={{
            color: "var(--foreground)",
            opacity: 0.6,
            fontSize: 11,
            fontWeight: "bold",
          }}
        >
          {char.classLabel}
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
          marginBottom: 14,
        }}
      >
        <StatBar
          label="📚 KIẾN THỨC MÁC"
          value={char.stats.knowledge}
          color="var(--primary)"
        />
        <StatBar
          label="⚡ Ý CHÍ"
          value={char.stats.willpower}
          color="var(--primary)"
        />
        <StatBar
          label="💰 VỐN TÍCH LŨY"
          value={char.stats.wealth}
          color="var(--primary)"
        />
        <StatBar
          label="🫂 ẢNH HƯỞNG XH"
          value={char.stats.social}
          color="var(--primary)"
        />
      </div>
      {char.gems.length > 0 && (
        <div>
          <div
            style={{
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 8,
              fontWeight: "bold",
            }}
          >
            LUẬN ĐIỂM ĐÃ NẮM
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {char.gems.map((gem, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                  color: "var(--primary)",
                  fontSize: 11,
                  fontWeight: "bold",
                  background: "var(--background)",
                }}
              >
                ✦ {gem}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════ MAIN COMPONENT ═══════════════════

interface RPGGameProps {
  onExit: () => void;
  externalPhase?: Phase;
  setExternalPhase?: (p: Phase) => void;
  externalSlideIndex?: number;
  setExternalSlideIndex?: (s: number) => void;
  character: Character | null;
  setCharacter: (c: Character | null) => void;
}

export default function RPGGame({
  onExit,
  externalPhase,
  setExternalPhase,
  externalSlideIndex,
  setExternalSlideIndex,
  character,
  setCharacter,
}: RPGGameProps) {
  const [phase, setInternalPhase] = useState<Phase>(externalPhase || "landing");
  const [sceneId, setSceneId] = useState<SceneId>("prologue");
  const [currentSlideIndex, setInternalSlideIndex] = useState(
    externalSlideIndex || 0,
  );

  // Sync with external state if provided
  useEffect(() => {
    if (externalPhase) setInternalPhase(externalPhase);
  }, [externalPhase]);

  useEffect(() => {
    if (externalSlideIndex !== undefined)
      setInternalSlideIndex(externalSlideIndex);
  }, [externalSlideIndex]);

  // Wrappers to update both internal and external state
  const setPhase = (p: Phase) => {
    setInternalPhase(p);
    if (setExternalPhase) setExternalPhase(p);
  };

  const setCurrentSlideIndex = (i: number) => {
    setInternalSlideIndex(i);
    if (setExternalSlideIndex) setExternalSlideIndex(i);
  };
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [pendingNext, setPendingNext] = useState<
    SceneId | EndingId | "battle" | null
  >(null);
  const [endingId, setEndingId] = useState<EndingId | null>(null);
  const [statDelta, setStatDelta] = useState<Partial<Stats>>({});
  const [showDelta, setShowDelta] = useState(false);

  // Economy state (c + v + m)
  const [economy, setEconomy] = useState<EconomyStats>({
    c: 60,
    v: 40,
    m: 40,
    totalValue: 140,
    m_prime: 100,
    cv_ratio: 1.5,
    extraM: 0,
  });

  // Battle state
  const [battle, setBattle] = useState<BattleState>({
    playerHP: 100,
    enemyHP: 100,
    round: 0,
    phase: "attack",
    lastResult: null,
    won: false,
  });

  // ── Character creation ──
  const [selectedClass, setSelectedClass] = useState<CharacterClass>("worker");
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);

  const startGame = () => {
    const cfg = CLASS_CONFIGS[selectedClass];
    const newChar: Character = {
      name: `Đồng chí ${cfg.label}`,
      characterClass: selectedClass,
      emoji: cfg.emoji,
      classLabel: cfg.label,
      stats: { ...cfg.stats },
      gems: [],
      history: [],
      achievements: [],
    };
    setCharacter(newChar);
    setSceneId("prologue");
    setPhase("scene");
  };

  const finishSlides = () => {
    setPhase("ai_usage");
  };

  // ── Handle choice ──
  const handleChoice = (choice: Choice) => {
    if (!character) return;

    // Check requirement
    if (choice.requirement) {
      const { stat, min } = choice.requirement;
      if (character.stats[stat] < min) return; // Locked choice - do nothing
    }

    // Calculate effect with role bonus
    let effectMultiplier = 1;
    if (choice.roleBonus && choice.roleBonus === character.characterClass) {
      effectMultiplier = 1.5; // 50% bonus for matching role
    }

    const delta: Partial<Stats> = {};
    const boostedEffect = { ...choice.effect };
    if (choice.effect.knowledge) {
      const val = Math.round(choice.effect.knowledge * effectMultiplier);
      boostedEffect.knowledge = val;
      delta.knowledge = val;
    }
    if (choice.effect.willpower) {
      const val = Math.round(choice.effect.willpower * effectMultiplier);
      boostedEffect.willpower = val;
      delta.willpower = val;
    }
    if (choice.effect.wealth) {
      const val = Math.round(choice.effect.wealth * effectMultiplier);
      boostedEffect.wealth = val;
      delta.wealth = val;
    }
    if (choice.effect.social) {
      const val = Math.round(choice.effect.social * effectMultiplier);
      boostedEffect.social = val;
      delta.social = val;
    }

    const newStats = applyEffect(character.stats, boostedEffect);
    const newGems = choice.effect.gem
      ? [...character.gems, choice.effect.gem]
      : character.gems;
    const newHistory = [...character.history, choice.text.slice(0, 50)];
    const newAchievements = [
      ...character.achievements,
      ...checkAchievements(
        {
          ...character,
          stats: newStats,
          gems: newGems,
          history: newHistory,
        },
        sceneId,
      ),
    ];
    setCharacter({
      ...character,
      stats: newStats,
      gems: newGems,
      history: newHistory,
      achievements: newAchievements,
    });
    setStatDelta(delta);
    setShowDelta(true);
    setTimeout(() => setShowDelta(false), 2500);

    // Add role bonus notification to feedback
    let finalFeedback = choice.feedback;
    if (effectMultiplier > 1) {
      finalFeedback =
        `🌟 [Bonus ${CLASS_CONFIGS[character.characterClass].label}!] ` +
        finalFeedback;
    }
    setFeedbackMsg(finalFeedback);
    setPendingNext(choice.next);
    setPhase("feedback");
  };

  // ── Challenge logic ──
  const handleChallengeAnswered = (optionIndex: number) => {
    const challenge = CHALLENGES[currentChallenge || ""];
    if (!challenge || !character) return;

    const option = challenge.options[optionIndex];
    const isCorrect = option.isCorrect;
    const reward = option.reward;
    const penalty = isCorrect ? { knowledge: 0 } : challenge.penalty;
    const effect = isCorrect ? reward : penalty;

    const newStats = applyEffect(character.stats, effect);
    const newAchievements = [
      ...character.achievements,
      ...checkAchievements(
        {
          ...character,
          stats: newStats,
          gems: character.gems,
          history: character.history,
        },
        sceneId,
      ),
    ];

    setCharacter({
      ...character,
      stats: newStats,
      achievements: newAchievements,
    });

    setStatDelta(effect);
    setShowDelta(true);
    setTimeout(() => setShowDelta(false), 2000);

    // Feedback
    const fbk = isCorrect ? `✓ ${option.feedback}` : `✗ ${option.feedback}`;
    setFeedbackMsg(fbk);

    setTimeout(() => {
      setCurrentChallenge(null);
      setPhase("scene");
    }, 2500);
  };

  // ── Advance from feedback ──
  const advanceFromFeedback = () => {
    if (!pendingNext || !character) return;
    if (pendingNext === "battle") {
      setBattle({
        playerHP: 100,
        enemyHP: 100,
        round: 0,
        phase: "attack",
        lastResult: null,
        won: false,
      });
      setPhase("battle");
    } else if (pendingNext.startsWith("ending_")) {
      const eid = pendingNext as EndingId;
      setEndingId(eid);
      setPhase("cinema");
    } else {
      setSceneId(pendingNext as SceneId);
      setPhase("scene");
    }
    setFeedbackMsg("");
    setPendingNext(null);
  };

  // ── Battle logic ──
  const handleBattleChoice = (opt: BattleOption) => {
    if (!character) return;
    const newPlayerHP = Math.max(0, battle.playerHP - opt.playerDmg);
    const newEnemyHP = Math.max(0, battle.enemyHP - opt.enemyDmg);

    // Give knowledge bonus for correct answers
    if (opt.type === "correct") {
      const newStats = applyEffect(character.stats, { knowledge: 10 });
      setCharacter({ ...character, stats: newStats });
    }

    setBattle((prev) => ({
      ...prev,
      playerHP: newPlayerHP,
      enemyHP: newEnemyHP,
      phase: "result",
      lastResult: {
        type: opt.type,
        response: opt.response,
        enemyDmg: opt.enemyDmg,
        playerDmg: opt.playerDmg,
      },
    }));
  };

  const advanceBattle = () => {
    const nextRound = battle.round + 1;
    if (
      battle.enemyHP <= 0 ||
      battle.playerHP <= 0 ||
      nextRound >= BATTLE.rounds.length
    ) {
      const won = battle.enemyHP <= 0 || battle.playerHP > battle.enemyHP;
      // Apply battle outcome stats
      if (character) {
        const bonus = won
          ? { social: 20, willpower: 10, knowledge: 5 }
          : { willpower: 5, knowledge: 5 };
        const newStats = applyEffect(character.stats, bonus);
        const newGems = won
          ? [...character.gems, "Chiến Thắng Tranh Luận"]
          : character.gems;
        setCharacter({ ...character, stats: newStats, gems: newGems });
      }
      setBattle((prev) => ({ ...prev, phase: "complete", won }));
    } else {
      setBattle((prev) => ({
        ...prev,
        round: nextRound,
        phase: "attack",
        lastResult: null,
      }));
    }
  };

  const finishBattle = () => {
    setPhase("management");
  };

  const finishManagement = () => {
    setSceneId("crossroads");
    setPhase("scene");
  };

  // ── Ending ──
  const handleEndingComplete = () => {
    if (!character) return;
    const computedEnding = determineEnding(character);
    if (endingId !== computedEnding && !endingId) {
      setEndingId(computedEnding);
    }
    setPhase("cinema");
  };

  // ═══ RENDER ═══

  if (phase === "landing") {
    return <LandingView onStart={() => setPhase("rules")} />;
  }

  if (phase === "rules") {
    return <RulesView onContinue={() => setPhase("create")} />;
  }

  if (phase === "create") {
    return (
      <CharacterCreationScreen
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        onStart={startGame}
        onExit={onExit}
      />
    );
  }

  if (phase === "cinema" && endingId) {
    return (
      <CinemaScreen
        endingId={endingId}
        character={character!}
        onComplete={() => setPhase("ending")}
      />
    );
  }

  if (phase === "challenge" && currentChallenge) {
    return (
      <ChallengeScreen
        challenge={CHALLENGES[currentChallenge]}
        character={character!}
        onAnswered={(idx) => {
          handleChallengeAnswered(idx);
        }}
      />
    );
  }

  if (phase === "ending" && endingId) {
    return (
      <EndingScreen
        ending={ENDINGS[endingId]}
        character={character!}
        onRestart={() => {
          setPhase("create");
          setCharacter(null);
          setSceneId("prologue");
        }}
        onHome={onExit}
      />
    );
  }

  const scene = SCENES[sceneId];
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "24px 16px 40px" }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 220px",
          gap: 24,
        }}
      >
        {/* Main content */}
        <div>
          {phase === "intro_slides" ? (
            <IntroSlidesScreen
              slides={INTRO_SLIDES}
              currentIndex={currentSlideIndex}
              setCurrentIndex={setCurrentSlideIndex}
              onFinish={finishSlides}
            />
          ) : phase === "battle" && character ? (
            <BattleScreen
              battle={battle}
              character={character}
              onChoose={handleBattleChoice}
              onAdvance={advanceBattle}
              onFinish={finishBattle}
            />
          ) : phase === "management" ? (
            <EconomicSimScreen
              economy={economy}
              setEconomy={setEconomy}
              onFinish={finishManagement}
            />
          ) : phase === "ai_usage" ? (
            <AIUsageScreen
              character={character}
              onStart={() => setPhase("landing")}
            />
          ) : character ? (
            <SceneScreen
              scene={scene}
              phase={phase}
              feedbackMsg={feedbackMsg}
              showDelta={showDelta}
              statDelta={statDelta}
              onChoice={handleChoice}
              onAdvance={advanceFromFeedback}
              character={character}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <p>Loading game...</p>
            </div>
          )}
        </div>

        {/* Character panel */}
        {character && <CharPanel char={character} />}
      </div>
    </div>
  );
}

// ═══════════════════ CHARACTER CREATION SCREEN ═══════════════════

function PresentationScreen({ onFinish }: { onFinish: () => void }) {
  const [slide, setSlide] = useState(0);

  const content = [
    {
      title: "I. Bản chất Lao động trong Kỷ nguyên Số",
      subtitle: "Lao động cụ thể vs. Lao động trừu tượng 4.0",
      sections: [
        {
          heading: "Lao động Cụ thể",
          text: "Chuyển từ thao tác cơ bắp sang lập trình, điều khiển hệ thống AI, vận hành robot và quản trị dữ liệu. Mục đích vẫn là tạo ra giá trị sử dụng (sản phẩm số, dịch vụ thông minh), nhưng công cụ lao động đã chuyển sang máy tính điện tử và hệ thống thông tin.",
          example:
            "Trong nhà máy Tesla, robot lắp ráp xe nhưng con người lập trình hệ thống và giám sát sản xuất.",
        },
        {
          heading: "Lao động Trừu tượng",
          text: "Trong kỷ nguyên số, lao động trừu tượng chủ yếu tồn tại dưới dạng lao động trí tuệ tiêu hao sức thần kinh và trí não. Đây là lao động phức tạp, tạo ra lượng giá trị lớn hơn nhiều lần lao động giản đơn.",
          example:
            "Giá trị hàng hóa không chỉ còn là kết tinh sức cơ bắp mà là sự 'vật hóa' của tri thức con người.",
        },
      ],
    },
    {
      title: "II. Giá trị & Thặng dư khi Máy móc thay thế Con người",
      subtitle: "Bản chất của AI và Robot (Tư bản bất biến c)",
      sections: [
        {
          heading: "Máy móc không tự tạo giá trị",
          text: "AI và Robot chỉ là tư bản bất biến (c). Chúng chỉ chuyển giá trị của chính mình vào sản phẩm thông qua khấu hao, không thể tự tạo ra giá trị thặng dư nếu không có con người vận hành.",
          example:
            "Robot sản xuất giá trị lớn sẽ dần chuyển giá trị vào sản phẩm thông qua khấu hao định kỳ.",
        },
        {
          heading: "Nguồn gốc Thặng dư (m)",
          text: "Vẫn chỉ được tạo ra bởi lao động sống (v). Việc áp dụng AI làm tăng năng suất, hạ thấp giá trị sức lao động, từ đó tạo ra giá trị thặng dư tương đối và siêu ngạch.",
          example:
            "Amazon sử dụng robot giảm thời gian xử lý đơn hàng, từ đó tối ưu hóa lợi nhuận và thặng dư siêu ngạch.",
        },
      ],
    },
    {
      title: "III. Nguồn nhân lực chất lượng cao tại Việt Nam",
      subtitle: "Thích ứng với Nền kinh tế Tri thức & CMCN 4.0",
      sections: [
        {
          heading: "Chuyển dịch Cơ cấu",
          text: "Việt Nam định hướng chuyển từ lao động thủ công sang lao động dựa trên tri thức và kỹ năng số. Đây là quá trình chuyển từ lao động giản đơn sang lao động phức tạp.",
          example:
            "Nhu cầu kỹ thuật viên vận hành máy tăng cao trong khi công nhân lắp ráp thủ công giảm dần.",
        },
        {
          heading: "Nâng cao năng lực cạnh tranh",
          text: "Tập trung đào tạo chuyên gia AI, Big Data. Người lao động cần khả năng sáng tạo, đổi mới và học tập suốt đời để không bị thay thế bởi máy móc.",
          example:
            "FPT đào tạo nhân lực chất lượng cao để phát triển phần mềm có giá trị gia tăng lớn.",
        },
      ],
    },
  ];

  const current = content[slide];

  return (
    <div
      className="industrial-container"
      style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 0" }}
    >
      <motion.div
        key={slide}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-industrial"
        style={{
          padding: "60px",
          border: "1px solid var(--primary)",
          minHeight: 650,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            fontSize: 12,
            color: "var(--primary)",
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          PRESENTATION_MODULE // 0{slide + 1} OF 03
        </div>

        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              background: "var(--primary)",
              color: "white",
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: "900",
              marginBottom: 15,
              borderRadius: 2,
            }}
          >
            THEORETICAL BRIEFING
          </div>
          <h2
            style={{
              fontSize: 42,
              fontFamily: "var(--font-slab)",
              margin: 0,
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {current.title}
          </h2>
          <p
            style={{
              color: "var(--primary)",
              fontWeight: "700",
              fontSize: 20,
              marginTop: 10,
            }}
          >
            {current.subtitle}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            flex: 1,
          }}
        >
          {current.sections.map((sec, i) => (
            <div
              key={i}
              className="industrial-card"
              style={{
                padding: 30,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(165, 28, 48, 0.1)",
              }}
            >
              <h4
                style={{
                  color: "var(--primary)",
                  fontSize: 22,
                  marginBottom: 20,
                  fontWeight: "900",
                  borderLeft: "4px solid var(--primary)",
                  paddingLeft: 15,
                }}
              >
                {sec.heading}
              </h4>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "var(--foreground)",
                  opacity: 0.8,
                  marginBottom: 25,
                }}
              >
                {sec.text}
              </p>
              <div
                style={{
                  background: "var(--muted)",
                  padding: 20,
                  border: "1px dashed var(--primary)",
                  borderRadius: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: "900",
                    color: "var(--primary)",
                    display: "block",
                    marginBottom: 8,
                    letterSpacing: 1,
                  }}
                >
                  [ TRỰC QUAN HÓA / VÍ DỤ ]
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontStyle: "italic",
                    color: "var(--foreground)",
                  }}
                >
                  {sec.example}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
          <button
            onClick={onFinish}
            className="btn-primary"
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: 2,
            }}
          >
            TÔI ĐÃ HIỂU, TIẾP TỤC ➔
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CharacterCreationScreen({
  selectedClass,
  setSelectedClass,
  onStart,
  onExit,
}: {
  selectedClass: CharacterClass;
  setSelectedClass: (c: CharacterClass) => void;
  onStart: () => void;
  onExit: () => void;
}) {
  const cfg = CLASS_CONFIGS[selectedClass];
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-block",
              border: "1px solid var(--primary)",
              padding: "5px 18px",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                color: "var(--primary)",
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: "900",
              }}
            >
              HỒ SƠ NHÂN VẬT · GIÁC NGỘ SỐ
            </span>
          </div>
          <h1
            style={{
              color: "var(--foreground)",
              fontSize: "clamp(22px, 4vw, 36px)",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            Tạo Nhân Vật
          </h1>
          <p style={{ color: "var(--foreground)", opacity: 0.6, fontSize: 14 }}>
            Bạn là ai trong kỷ nguyên AI? Lựa chọn ảnh hưởng đến tương lai người
            lao động.
          </p>
        </div>

        {/* Class selection */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {(Object.keys(CLASS_CONFIGS) as CharacterClass[]).map((cls) => {
            const c = CLASS_CONFIGS[cls];
            const active = selectedClass === cls;
            return (
              <div
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className="industrial-card"
                style={{
                  padding: 18,
                  border: active
                    ? `3px solid var(--primary)`
                    : `1px solid var(--border)`,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textAlign: "center",
                  background: active ? "var(--muted)" : "transparent",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>{c.emoji}</div>
                <div
                  style={{
                    color: active ? "var(--primary)" : "var(--foreground)",
                    fontWeight: "900",
                    fontSize: 15,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    color: "var(--foreground)",
                    opacity: 0.7,
                    fontSize: 12,
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {c.desc}
                </div>
                <div
                  style={{
                    color: "var(--primary)",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  {c.perk}
                </div>
              </div>
            );
          })}
        </div>

        {/* Starting stats preview */}
        <div
          className="industrial-card"
          style={{
            padding: 18,
            marginBottom: 24,
            border: "1px solid var(--primary)",
          }}
        >
          <div
            style={{
              color: "var(--primary)",
              fontSize: 11,
              letterSpacing: 1,
              marginBottom: 12,
              fontWeight: "900",
            }}
          >
            CHỈ SỐ KHỞI ĐẦU · {cfg.label.toUpperCase()}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {[
              { label: "📚 KIẾN THỨC MÁC", val: cfg.stats.knowledge },
              { label: "⚡ Ý CHÍ", val: cfg.stats.willpower },
              { label: "💰 VỐN TÍCH LŨY", val: cfg.stats.wealth },
              { label: "🫂 ẢNH HƯỞNG XH", val: cfg.stats.social },
            ].map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--foreground)",
                    opacity: 0.7,
                    marginBottom: 3,
                    fontWeight: "bold",
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ color: "var(--primary)" }}>{s.val}</span>
                </div>
                <div
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    height: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${s.val}%`,
                      height: "100%",
                      background: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }} />

        <button
          className="btn-primary"
          onClick={onStart}
          style={{
            padding: "15px 40px",
            fontSize: 17,
            width: "100%",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          ⚔️ BẮT ĐẦU DẤN THÂN
        </button>
      </div>
    </div>
  );
}

// ═══════════════════ SCENE SCREEN ═══════════════════

function SceneScreen({
  scene,
  phase,
  feedbackMsg,
  showDelta,
  statDelta,
  onChoice,
  onAdvance,
  character,
}: {
  scene: Scene;
  phase: Phase;
  feedbackMsg: string;
  showDelta: boolean;
  statDelta: Partial<Stats>;
  onChoice: (c: Choice) => void;
  onAdvance: () => void;
  character: Character;
}) {
  const accent = scene.bgAccent || "var(--primary)";

  return (
    <div
      key={scene.id}
      className="scale-in"
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at top right, ${accent}18, transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.18), transparent 25%)`,
          pointerEvents: "none",
        }}
      />

      {/* Setting banner */}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.72), rgba(255,255,255,0.36))",
          border: "1px solid rgba(88, 60, 43, 0.35)",
          padding: "12px 16px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
          boxShadow: "0 8px 24px rgba(88, 60, 43, 0.08)",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            background: accent,
            flexShrink: 0,
            boxShadow: `0 0 0 4px ${accent}22`,
          }}
        />
        <span
          style={{
            color: accent,
            fontSize: 11,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {scene.setting}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          color: "var(--foreground)",
          marginBottom: 18,
          fontSize: "clamp(24px, 3.2vw, 36px)",
          textTransform: "uppercase",
          borderBottom: `3px solid ${accent}`,
          display: "inline-block",
          paddingBottom: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        {scene.title}
      </h2>

      {/* Narrative */}
      <div
        style={{
          padding: 26,
          marginBottom: 18,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.56))",
          border: "1px solid rgba(88, 60, 43, 0.22)",
          boxShadow: "0 18px 32px rgba(88, 60, 43, 0.12)",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `${accent}12`,
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            color: accent,
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 12,
            position: "relative",
          }}
        >
          Toàn cảnh tình huống
        </div>
        <p
          style={{
            color: "var(--foreground)",
            lineHeight: 1.9,
            fontSize: 15,
            margin: 0,
            position: "relative",
          }}
        >
          {scene.narrative}
        </p>
      </div>

      {/* NPC dialogue */}
      {scene.npc && (
        <div
          className="slide-left"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,255,255,0.38))",
            border: "1px solid rgba(88, 60, 43, 0.22)",
            padding: 20,
            marginBottom: 20,
            borderRadius: 18,
            boxShadow: "0 14px 28px rgba(88, 60, 43, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                textAlign: "center",
                flexShrink: 0,
                width: 92,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 8px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `${accent}16`,
                  border: `1px solid ${accent}44`,
                  fontSize: 34,
                }}
              >
                {scene.npc.emoji}
              </div>
              <div
                style={{
                  color: accent,
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: "900",
                  textTransform: "uppercase",
                }}
              >
                {scene.npc.name}
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  opacity: 0.5,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {scene.npc.role}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                background: "rgba(255,255,255,0.38)",
                borderRadius: 14,
                border: "1px solid rgba(88, 60, 43, 0.14)",
              }}
            >
              <p
                style={{
                  color: "var(--foreground)",
                  lineHeight: 1.7,
                  fontSize: 14,
                  margin: 0,
                  fontStyle: "italic",
                  borderLeft: `3px solid ${accent}`,
                  paddingLeft: 14,
                }}
              >
                &ldquo;{scene.npc.dialogue}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback phase */}
      {phase === "feedback" && feedbackMsg && (
        <div className="fade-in">
          <div
            style={{
              border: `1px solid ${accent}`,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.5))",
              padding: 20,
              marginBottom: 18,
              borderRadius: 16,
              boxShadow: "0 12px 24px rgba(88, 60, 43, 0.08)",
            }}
          >
            <p
              style={{
                color: "var(--foreground)",
                lineHeight: 1.7,
                fontSize: 14,
                margin: 0,
              }}
            >
              {feedbackMsg}
            </p>
          </div>

          {/* Stat delta display */}
          {showDelta && Object.keys(statDelta).length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {Object.entries(statDelta).map(([key, val]) => {
                if (!val || val === 0) return null;
                return (
                  <div
                    key={key}
                    style={{
                      border: `1px solid ${accent}`,
                      padding: "6px 14px",
                      color: accent,
                      fontSize: 11,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      background: `${accent}12`,
                    }}
                  >
                    {val > 0 ? "+" : ""}
                    {val} {key}
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={onAdvance}
            style={{
              padding: "12px 32px",
              fontSize: 15,
              width: "100%",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            TIẾP TỤC HÀNH TRÌNH →
          </button>
        </div>
      )}

      {/* Choice phase */}
      {phase === "scene" && (
        <div>
          <p
            style={{
              color: "var(--foreground)",
              opacity: 0.65,
              fontSize: 12,
              marginBottom: 14,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ▶ Chọn cách hành động trong biến cố:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {scene.choices.map((choice, i) => {
              const isLocked =
                choice.requirement &&
                character.stats[choice.requirement.stat] <
                  choice.requirement.min;
              const hasBonus = choice.roleBonus === character.characterClass;

              return (
                <div
                  key={i}
                  onClick={() => !isLocked && onChoice(choice)}
                  style={{
                    padding: 20,
                    border: isLocked
                      ? "1px solid rgba(88, 60, 43, 0.12)"
                      : `1px solid ${accent}`,
                    background: isLocked
                      ? "linear-gradient(180deg, rgba(140,130,120,0.14), rgba(255,255,255,0.34))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.54))",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.6 : 1,
                    transition: "all 0.3s",
                    position: "relative",
                    borderRadius: 18,
                    boxShadow: isLocked
                      ? "none"
                      : "0 18px 28px rgba(88, 60, 43, 0.10)",
                    minHeight: 170,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: -30,
                      top: -30,
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: isLocked
                        ? "rgba(120,120,120,0.10)"
                        : `${accent}10`,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        border: isLocked
                          ? "1px solid rgba(88, 60, 43, 0.18)"
                          : `1px solid ${accent}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: accent,
                        fontSize: 13,
                        fontWeight: "900",
                        borderRadius: "50%",
                        background: isLocked
                          ? "rgba(255,255,255,0.35)"
                          : `${accent}12`,
                      }}
                    >
                      {isLocked ? "🔒" : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: accent,
                          fontSize: 10,
                          fontWeight: "900",
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {isLocked
                          ? "Lua chon tam thoi khoa"
                          : "Nuoc di cua bạn"}
                      </div>
                      <p
                        style={{
                          color: "var(--foreground)",
                          fontSize: 14,
                          lineHeight: 1.7,
                          margin: 0,
                          fontWeight: "bold",
                        }}
                      >
                        {choice.text}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginTop: 8,
                        }}
                      >
                        {choice.conceptTag && (
                          <span
                            style={{
                              border: `1px solid ${accent}`,
                              padding: "2px 10px",
                              color: accent,
                              fontSize: 10,
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRadius: 999,
                              background: `${accent}10`,
                            }}
                          >
                            {choice.conceptTag}
                          </span>
                        )}
                        {hasBonus && !isLocked && (
                          <span
                            style={{
                              background: accent,
                              padding: "2px 10px",
                              color: "var(--background)",
                              fontSize: 10,
                              fontWeight: "900",
                              textTransform: "uppercase",
                              borderRadius: 999,
                            }}
                          >
                            THẾ MẠNH{" "}
                            {CLASS_CONFIGS[character.characterClass].label}
                          </span>
                        )}
                        {isLocked && choice.requirement && (
                          <span
                            style={{
                              border: `1px solid ${accent}`,
                              padding: "2px 10px",
                              color: accent,
                              fontSize: 10,
                              fontWeight: "900",
                              borderRadius: 999,
                              background: `${accent}10`,
                            }}
                          >
                            YÊU CẦU: {choice.requirement.stat.toUpperCase()}{" "}
                            {choice.requirement.min}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════ BATTLE SCREEN ═══════════════════

function BattleScreen({
  battle,
  character,
  onChoose,
  onAdvance,
  onFinish,
}: {
  battle: BattleState;
  character: Character;
  onChoose: (opt: BattleOption) => void;
  onAdvance: () => void;
  onFinish: () => void;
}) {
  const currentRound =
    BATTLE.rounds[Math.min(battle.round, BATTLE.rounds.length - 1)];

  return (
    <div className="scale-in">
      {/* Battle header */}
      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--primary)",
          padding: "10px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 12, height: 12, background: "var(--primary)" }} />
        <span
          style={{
            color: "var(--primary)",
            fontSize: 11,
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          ⚔️ CUỘC ĐẤU LÝ LUẬN · SÁNG NAM KHU A
        </span>
      </div>

      <h2
        style={{
          color: "var(--foreground)",
          marginBottom: 4,
          textTransform: "uppercase",
          fontWeight: "900",
        }}
      >
        Đối Đầu Giám Đốc Toàn
      </h2>
      <p
        style={{
          color: "var(--foreground)",
          opacity: 0.6,
          fontSize: 12,
          marginBottom: 20,
          fontWeight: "bold",
        }}
      >
        Vòng {battle.round + 1} / {BATTLE.rounds.length} · Dùng vũ khí là LÝ
        LUẬN MÁC!
      </p>

      {/* HP bars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 16,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {/* Player */}
        <div
          className="industrial-card"
          style={{ padding: 16, textAlign: "center" }}
        >
          <div style={{ fontSize: 36, marginBottom: 6 }}>{character.emoji}</div>
          <div
            style={{
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: "900",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {character.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "var(--foreground)",
                opacity: 0.5,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              LÝ LUẬN
            </span>
            <div
              style={{
                flex: 1,
                background: "var(--muted)",
                height: 8,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: `${battle.playerHP}%`,
                  height: "100%",
                  background: "var(--primary)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <span
              style={{
                color: "var(--primary)",
                fontSize: 11,
                fontWeight: "900",
                minWidth: 24,
              }}
            >
              {battle.playerHP}
            </span>
          </div>
        </div>

        <div
          style={{ color: "var(--primary)", fontSize: 24, fontWeight: "900" }}
        >
          VS
        </div>

        {/* Enemy */}
        <div
          className="industrial-card"
          style={{ padding: 16, textAlign: "center" }}
        >
          <div style={{ fontSize: 36, marginBottom: 6 }}>
            {BATTLE.enemy.emoji}
          </div>
          <div
            style={{
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: "900",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {BATTLE.enemy.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "var(--foreground)",
                opacity: 0.5,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              LÝ LUẬN
            </span>
            <div
              style={{
                flex: 1,
                background: "var(--muted)",
                height: 8,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: `${battle.enemyHP}%`,
                  height: "100%",
                  background: "var(--foreground)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <span
              style={{
                color: "var(--foreground)",
                fontSize: 11,
                fontWeight: "900",
                minWidth: 24,
              }}
            >
              {battle.enemyHP}
            </span>
          </div>
        </div>
      </div>

      {/* Battle complete */}
      {battle.phase === "complete" ? (
        <div className="scale-in">
          <div
            style={{
              border: "2px solid var(--primary)",
              padding: 24,
              marginBottom: 20,
              textAlign: "center",
              background: "var(--muted)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {battle.won ? "🏆" : "💪"}
            </div>
            <h3
              style={{
                color: "var(--primary)",
                marginBottom: 12,
                fontWeight: "900",
                textTransform: "uppercase",
              }}
            >
              {battle.won ? "KHẲNG ĐỊNH CHÂN LÝ!" : "KẾT THÚC TRANH LUẬN"}
            </h3>
            <p
              style={{
                color: "var(--foreground)",
                fontSize: 14,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {battle.won
                ? "Xuất sắc! Bạn đã dùng lý luận Mác để thuyết phục Giám đốc Toàn. Ông gật đầu thừa nhận sức mạnh của lao động sống và sự cần thiết của quỹ chuyển đổi lao động."
                : "Cuộc tranh luận kết thúc. Bạn đã gieo những hạt giống lý luận đầu tiên. Hãy tiếp tục dấn thân và tích lũy tri thức cho những cuộc đấu sắp tới!"}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={onFinish}
            style={{
              padding: "14px 32px",
              fontSize: 16,
              width: "100%",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            TIẾP TỤC HÀNH TRÌNH →
          </button>
        </div>
      ) : battle.phase === "result" && battle.lastResult ? (
        <div className="fade-in">
          <div
            style={{
              border: "1px solid var(--primary)",
              padding: 18,
              marginBottom: 16,
              background: "var(--muted)",
            }}
          >
            <div
              style={{
                color: "var(--primary)",
                fontWeight: "900",
                marginBottom: 8,
                fontSize: 14,
                textTransform: "uppercase",
              }}
            >
              {battle.lastResult.type === "correct"
                ? "✦ LÝ LUẬN SẮC BÉN!"
                : battle.lastResult.type === "partial"
                  ? "✦ CÓ SỨC THUYẾT PHỤC!"
                  : "✦ TRUY VẤN LÝ LUẬN!"}
            </div>
            <p
              style={{
                color: "var(--foreground)",
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {battle.lastResult.response}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={onAdvance}
            style={{
              padding: "12px 32px",
              fontSize: 15,
              width: "100%",
              fontWeight: "900",
            }}
          >
            {battle.round + 1 >= BATTLE.rounds.length ||
            battle.enemyHP <= 0 ||
            battle.playerHP <= 0
              ? "KẾT THÚC ĐỐI ĐẦU →"
              : `VÒNG TIẾP THEO →`}
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
              padding: 18,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>
                {BATTLE.enemy.emoji}
              </div>
              <div>
                <div
                  style={{
                    color: "var(--primary)",
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: "900",
                  }}
                >
                  {BATTLE.enemy.name.toUpperCase()} TẤN CÔNG:
                </div>
                <p
                  style={{
                    color: "var(--foreground)",
                    lineHeight: 1.7,
                    fontSize: 14,
                    margin: 0,
                    fontStyle: "italic",
                    borderLeft: "2px solid var(--primary)",
                    paddingLeft: 12,
                  }}
                >
                  &ldquo;{currentRound.enemyLine}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <p
            style={{
              color: "var(--foreground)",
              opacity: 0.5,
              fontSize: 11,
              marginBottom: 12,
              fontWeight: "bold",
            }}
          >
            ▶ ĐÁP TRẢ BẰNG VŨ KHÍ LÝ LUẬN:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentRound.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => onChoose(opt)}
                style={{
                  padding: 16,
                  border: "1px solid var(--primary)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    border: "1px solid var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: "900",
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    color: "var(--foreground)",
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: 0,
                    fontWeight: "bold",
                  }}
                >
                  {opt.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EconomicSimScreen({
  economy,
  setEconomy,
  onFinish,
}: {
  economy: EconomyStats;
  setEconomy: React.Dispatch<React.SetStateAction<EconomyStats>>;
  onFinish: () => void;
}) {
  const updateC = (newC: number) => {
    const total = newC + economy.v + economy.m + economy.extraM;
    setEconomy((prev) => ({
      ...prev,
      c: newC,
      totalValue: total,
      cv_ratio: newC / (prev.v || 1),
    }));
  };

  const updateV = (newV: number) => {
    const newM = (economy.m_prime * newV) / 100;
    const total = economy.c + newV + newM + economy.extraM;
    setEconomy((prev) => ({
      ...prev,
      v: newV,
      m: newM,
      totalValue: total,
      cv_ratio: prev.c / (newV || 1),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="industrial-container"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <div
        className="glass-industrial"
        style={{ padding: "40px", border: "1px solid var(--primary)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              color: "var(--primary)",
              fontWeight: "900",
              fontSize: 11,
              letterSpacing: 4,
              marginBottom: 10,
            }}
          >
            [ LABOR_MANAGEMENT_SIM ]
          </div>
          <h2
            style={{
              fontSize: 32,
              fontFamily: "var(--font-slab)",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Quản Lý Tư Bản & Thặng Dư
          </h2>
          <div
            style={{
              height: 3,
              width: 60,
              background: "var(--primary)",
              margin: "15px auto",
            }}
          />
          <p
            style={{
              color: "var(--foreground)",
              opacity: 0.7,
              fontSize: 14,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Điều chỉnh các thành phần của tư bản để hiểu rõ quy luật bóc lột và
            sự phát triển của lực lượng sản xuất trí tuệ.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 40 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: "900", fontSize: 13 }}>
                  ⚙️ TƯ BẢN BẤT BIẾN (c)
                </span>
                <span style={{ color: "var(--primary)", fontWeight: "900" }}>
                  {economy.c.toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={economy.c}
                onChange={(e) => updateC(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 5 }}>
                Máy móc, AI, hạ tầng kỹ thuật...
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: "900", fontSize: 13 }}>
                  👥 TƯ BẢN KHẢ BIẾN (v)
                </span>
                <span style={{ color: "var(--primary)", fontWeight: "900" }}>
                  {economy.v.toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={economy.v}
                onChange={(e) => updateV(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 5 }}>
                Sức lao động, tiền lương nhân viên...
              </div>
            </div>

            <div
              style={{
                background: "rgba(165, 28, 48, 0.05)",
                padding: 20,
                border: "1px dashed var(--primary)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: "var(--primary)",
                  marginBottom: 10,
                }}
              >
                [ CHỈ SỐ LÝ LUẬN ]
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12 }}>Tỷ suất thặng dư (m')</span>
                <span style={{ fontWeight: "900" }}>{economy.m_prime}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12 }}>Cấu tạo hữu cơ (c/v)</span>
                <span style={{ fontWeight: "900" }}>
                  {economy.cv_ratio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ marginBottom: 30 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  marginBottom: 15,
                  textAlign: "center",
                }}
              >
                CẤU TRÚC GIÁ TRỊ HÀNG HÓA (G = c + v + m)
              </div>
              <ValueBars economy={economy} />
            </div>

            <div
              style={{
                background: "var(--muted)",
                padding: 25,
                borderRadius: 4,
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  fontSize: 14,
                  color: "var(--primary)",
                  fontWeight: "900",
                }}
              >
                PHÂN TÍCH CHIẾN LƯỢC:
              </h4>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: 0,
                  opacity: 0.8,
                }}
              >
                {economy.cv_ratio > 2
                  ? "Bạn đang đầu tư mạnh vào AI và công nghệ (c tăng). Điều này làm tăng năng suất lao động nhưng cũng làm tăng cấu tạo hữu cơ của tư bản, có xu hướng làm giảm tỷ suất lợi nhuận trong dài hạn."
                  : "Bạn đang dựa nhiều vào lao động sống (v). Đây là nguồn gốc duy nhất tạo ra giá trị thặng dư m, nhưng chi phí quản lý con người sẽ cao hơn và tốc độ sản xuất thấp hơn."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="btn-primary"
          style={{
            width: "100%",
            marginTop: 40,
            padding: 20,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          HÒA THÀNH QUẢN LÝ ➔
        </button>
      </div>
    </motion.div>
  );
}

function EndingScreen({
  ending,
  character,
  onRestart,
  onHome,
}: {
  ending: (typeof ENDINGS)[EndingId];
  character: Character;
  onRestart: () => void;
  onHome: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "summary" | "stats" | "achievements"
  >("summary");

  const unlockedAchievements = character.achievements
    .map((id) => Object.values(ACHIEVEMENTS).find((a) => a.id === id))
    .filter(Boolean);

  const highlightStats = ending.highlightStats as Array<keyof Stats>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background) 0%, rgba(88, 86, 214, 0.08) 100%)",
        padding: "40px 20px",
        overflow: "auto",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: 120,
              marginBottom: 30,
              filter: "drop-shadow(0 0 20px rgba(88, 86, 214, 0.3))",
            }}
          >
            {ending.emoji}
          </motion.div>

          <div
            style={{
              color: "var(--primary)",
              fontWeight: "900",
              fontSize: 12,
              letterSpacing: 3,
              marginBottom: 15,
              textTransform: "uppercase",
            }}
          >
            ✦ Chương 6: Kết Thúc ✦
          </div>

          <h1
            style={{
              fontSize: 64,
              fontFamily: "var(--font-slab)",
              margin: "0 0 20px 0",
              color: "var(--foreground)",
              fontWeight: "900",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {ending.title}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
              fontSize: 14,
              color: "var(--foreground)",
              opacity: 0.7,
            }}
          >
            <span>👤 {character.name}</span>
            <span>•</span>
            <span>📅 Năm {ending.year}</span>
            <span>•</span>
            <span>📊 {character.history.length} quyết định</span>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 30,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "summary" as const, label: "Kết Thúc", icon: "📖" },
            { id: "stats" as const, label: "Thống Kê", icon: "📊" },
            {
              id: "achievements" as const,
              label: `Thành Tích (${unlockedAchievements.length})`,
              icon: "🏆",
            },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "12px 20px",
                background:
                  activeTab === tab.id
                    ? "linear-gradient(135deg, var(--primary), rgba(88, 86, 214, 0.8))"
                    : "rgba(88, 86, 214, 0.1)",
                border:
                  activeTab === tab.id
                    ? "1px solid var(--primary)"
                    : "1px solid rgba(88, 86, 214, 0.2)",
                color: activeTab === tab.id ? "white" : "var(--foreground)",
                fontSize: 13,
                fontWeight: "900",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 30,
            marginBottom: 40,
          }}
        >
          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "summary" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Narrative */}
                <div
                  style={{
                    background: "rgba(88, 86, 214, 0.08)",
                    padding: 32,
                    borderRadius: 12,
                    borderLeft: "4px solid var(--primary)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "var(--primary)",
                      letterSpacing: 1,
                      margin: "0 0 16px 0",
                      textTransform: "uppercase",
                    }}
                  >
                    Hành Trình Kết Thúc
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.8,
                      color: "var(--foreground)",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    "{ending.narrative}"
                  </p>
                </div>

                {/* Marx Lesson */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(165, 28, 48, 0.08), rgba(88, 86, 214, 0.08))",
                    padding: 32,
                    borderRadius: 12,
                    border: "1px solid rgba(88, 86, 214, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>📚</span>
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: "900",
                        color: "var(--primary)",
                        letterSpacing: 1,
                        margin: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      Bài Học Mác-Xít
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "var(--foreground)",
                      margin: 0,
                      opacity: 0.85,
                    }}
                  >
                    {ending.marxLesson}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div
                style={{
                  background: "rgba(88, 86, 214, 0.08)",
                  padding: 32,
                  borderRadius: 12,
                  border: "1px solid rgba(88, 86, 214, 0.2)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: "var(--primary)",
                    letterSpacing: 1,
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  Chỉ Số Cuối Cùng
                </h3>
                {Object.entries(character.stats).map(([statKey, value], i) => {
                  const isHighlight = highlightStats.includes(
                    statKey as keyof Stats,
                  );
                  return (
                    <motion.div
                      key={statKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: "900",
                            textTransform: "capitalize",
                            color: isHighlight
                              ? "var(--primary)"
                              : "var(--foreground)",
                          }}
                        >
                          {statKey === "knowledge"
                            ? "🧠 Tri Thức"
                            : statKey === "willpower"
                              ? "💪 Ý Chí"
                              : statKey === "wealth"
                                ? "💰 Tài Phú"
                                : "🤝 Xã Hội"}
                          {isHighlight && " ⭐"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: "900",
                            color: "var(--primary)",
                          }}
                        >
                          {value}/100
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "rgba(88, 86, 214, 0.1)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{
                            height: "100%",
                            background: isHighlight
                              ? "linear-gradient(90deg, var(--primary), rgba(88, 86, 214, 0.7))"
                              : "linear-gradient(90deg, rgba(88, 86, 214, 0.5), rgba(88, 86, 214, 0.3))",
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {activeTab === "achievements" && (
              <div
                style={{
                  background: "rgba(88, 86, 214, 0.08)",
                  padding: 32,
                  borderRadius: 12,
                  border: "1px solid rgba(88, 86, 214, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: "var(--primary)",
                    letterSpacing: 1,
                    margin: "0 0 20px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Thành Tích Mở Khóa
                </h3>
                {unlockedAchievements.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      opacity: 0.6,
                      margin: 0,
                      padding: 20,
                    }}
                  >
                    Không có thành tích nào được mở khóa
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {unlockedAchievements.map((ach, i) => (
                      <motion.div
                        key={ach?.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{
                          y: -4,
                          boxShadow: "0 8px 16px rgba(88, 86, 214, 0.2)",
                        }}
                        style={{
                          background:
                            ach?.rarity === "legendary"
                              ? "linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(165, 28, 48, 0.2))"
                              : ach?.rarity === "epic"
                                ? "rgba(138, 43, 226, 0.2)"
                                : ach?.rarity === "rare"
                                  ? "rgba(30, 144, 255, 0.2)"
                                  : "rgba(88, 86, 214, 0.1)",
                          border:
                            ach?.rarity === "legendary"
                              ? "1px solid rgba(255, 215, 0, 0.5)"
                              : ach?.rarity === "epic"
                                ? "1px solid rgba(138, 43, 226, 0.5)"
                                : ach?.rarity === "rare"
                                  ? "1px solid rgba(30, 144, 255, 0.5)"
                                  : "1px solid rgba(88, 86, 214, 0.3)",
                          padding: 12,
                          borderRadius: 8,
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          cursor: "default",
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 4 }}>
                          {ach?.emoji}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: "900",
                            color: "var(--foreground)",
                            lineHeight: 1.3,
                          }}
                        >
                          {ach?.title}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Sidebar - Quick Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Character Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(88, 86, 214, 0.15), rgba(88, 86, 214, 0.05))",
                padding: 24,
                borderRadius: 12,
                border: "1px solid rgba(88, 86, 214, 0.3)",
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 12,
                }}
              >
                {character.emoji}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: "900",
                  color: "var(--foreground)",
                  marginBottom: 4,
                }}
              >
                {character.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--primary)",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {character.classLabel}
              </div>
            </div>

            {/* Summary Stats */}
            <div
              style={{
                background: "rgba(88, 86, 214, 0.08)",
                padding: 20,
                borderRadius: 12,
                border: "1px solid rgba(88, 86, 214, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h4
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: "var(--primary)",
                  margin: "0 0 12px 0",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Tóm Tắt
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--foreground)",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>💎 Gems:</span>
                  <span style={{ fontWeight: "900" }}>
                    {character.gems.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>📝 Quyết Định:</span>
                  <span style={{ fontWeight: "900" }}>
                    {character.history.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>🏆 Thành Tích:</span>
                  <span style={{ fontWeight: "900" }}>
                    {unlockedAchievements.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "14px 32px",
              background: "transparent",
              border: "1.5px solid rgba(88, 86, 214, 0.5)",
              color: "var(--foreground)",
              fontSize: 14,
              fontWeight: "900",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.background = "rgba(88, 86, 214, 0.1)";
              e.currentTarget.style.borderColor = "rgba(88, 86, 214, 0.7)";
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(88, 86, 214, 0.5)";
            }}
          >
            ↺ Thử Thách Lại
          </motion.button>
          <motion.button
            onClick={onHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "14px 32px",
              background:
                "linear-gradient(135deg, var(--primary), rgba(88, 86, 214, 0.8))",
              color: "white",
              fontSize: 14,
              fontWeight: "900",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ➔ Quay Về Trang Chủ
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function LegacyAIToolsScreen({ onFinish }: { onFinish: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "process" | "theory" | "transparency"
  >("overview");

  const tabs = [
    { id: "overview", label: "TỔNG QUAN HỆ THỐNG", icon: "🛠️" },
    { id: "process", label: "QUY TRÌNH KỸ THUẬT", icon: "🧪" },
    { id: "theory", label: "GÓC NHÌN LÝ LUẬN", icon: "📚" },
    { id: "transparency", label: "CAM KẾT MINH BẠCH", icon: "🛡️" },
  ];

  return (
    <div
      className="industrial-container"
      style={{
        maxWidth: 1150,
        margin: "0 auto",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <div
        className="glass-industrial"
        style={{
          display: "flex",
          minHeight: 700,
          border: "1px solid var(--primary)",
          overflow: "hidden",
          padding: 0,
          boxShadow:
            "0 0 40px rgba(0,0,0,0.5), inset 0 0 100px rgba(165, 28, 48, 0.05)",
        }}
      >
        {/* ── Left Sidebar (Control Panel) ── */}
        <div
          style={{
            width: 300,
            background:
              "linear-gradient(180deg, rgba(20,20,25,0.95) 0%, rgba(10,10,12,0.98) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            padding: "40px 0",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 8,
              opacity: 0.3,
              letterSpacing: 2,
              color: "var(--primary)",
            }}
          >
            SYSTEM_CORE_V2.1
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              width: 2,
              height: 40,
              background: "var(--primary)",
              opacity: 0.5,
            }}
          />

          <div style={{ padding: "0 40px", marginBottom: 50 }}>
            <div
              style={{
                color: "var(--primary)",
                fontWeight: "900",
                fontSize: 11,
                letterSpacing: 4,
                marginBottom: 8,
                opacity: 0.8,
              }}
            >
              CLASSIFIED
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: "900",
                fontFamily: "var(--font-slab)",
                margin: 0,
                color: "#fff",
                textShadow: "2px 2px 0 var(--primary)",
              }}
            >
              PHỤ LỤC AI
            </h2>
            <div
              style={{
                height: 2,
                width: 40,
                background: "var(--primary)",
                marginTop: 15,
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                whileHover={{ x: 5, background: "rgba(255,255,255,0.03)" }}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "18px 40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background:
                    activeTab === tab.id
                      ? "rgba(165, 28, 48, 0.15)"
                      : "transparent",
                  borderLeft:
                    activeTab === tab.id
                      ? "5px solid var(--primary)"
                      : "5px solid transparent",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                }}
              >
                {activeTab === "overview" && (
                  <div
                    style={{
                      position: "absolute",
                      right: 20,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      boxShadow: "0 0 10px var(--primary)",
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 22,
                    filter:
                      activeTab === tab.id
                        ? "none"
                        : "grayscale(1) opacity(0.5)",
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  {tab.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: "0 30px" }}>
            <button
              onClick={onFinish}
              className="btn-primary"
              style={{
                width: "100%",
                fontSize: 13,
                padding: "18px",
                borderRadius: "4px",
                background: "linear-gradient(45deg, #a51c30 0%, #7a1524 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 15px rgba(165, 28, 48, 0.2)",
              }}
            >
              HÀNH TRÌNH TIẾP TỤC ➔
            </button>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div
          style={{
            flex: 1,
            background: "rgba(18, 18, 22, 0.4)",
            padding: "60px",
            overflowY: "auto",
            maxHeight: 700,
            scrollbarWidth: "thin",
          }}
        >
          {activeTab === "overview" && (
            <div className="scale-in">
              <div style={{ marginBottom: 40 }}>
                <span
                  style={{
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  [ MODULE 01 ]
                </span>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: 36,
                    marginTop: 10,
                    marginBottom: 20,
                    fontFamily: "var(--font-slab)",
                    fontWeight: "900",
                  }}
                >
                  Hệ thống Công cụ (Tech Stack)
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  Dự án được vận hành bởi sự phối hợp nhịp nhàng giữa các thực
                  thể trí tuệ nhân tạo hàng đầu, tối ưu hóa từ lý luận đến thực
                  thi.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {[
                  {
                    name: "Gemini 1.5 Pro",
                    role: "Lý luận & Kịch bản",
                    desc: "Xương sống về nội dung, phân tích tầng sâu các văn bản Marx-Engels để chuyển hóa thành logic game.",
                    color: "#4285f4",
                    icon: "🧠",
                  },
                  {
                    name: "Claude 3.5 Sonnet",
                    role: "Cấu trúc & Kiểm soát",
                    desc: "Đảm bảo tính chặt chẽ của hệ thống kinh tế mô phỏng và tính nhất quán của các lựa chọn.",
                    color: "#d97706",
                    icon: "⚖️",
                  },
                  {
                    name: "Midjourney v6",
                    role: "Thẩm mỹ Thị giác",
                    desc: 'Kiến tạo phong cách "Industrial Marxist" đặc trưng qua các bối cảnh nhà máy và biểu tượng số.',
                    color: "#9333ea",
                    icon: "🎨",
                  },
                  {
                    name: "Antigravity AI Agent",
                    role: "Triển khai Kỹ thuật",
                    desc: "Cỗ máy thực thi trực tiếp các dòng mã React/Vite, tối ưu hóa hiệu suất và giao diện người dùng.",
                    color: "#ef4444",
                    icon: "🚀",
                  },
                ].map((t, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5, background: "rgba(255,255,255,0.05)" }}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "30px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderTop: `4px solid ${t.color}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 15,
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{t.icon}</span>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: 18,
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{
                            color: t.color,
                            fontSize: 10,
                            fontWeight: "900",
                            letterSpacing: 1,
                            marginTop: 4,
                          }}
                        >
                          {t.role.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        margin: 0,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: "500",
                      }}
                    >
                      {t.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "process" && (
            <div className="scale-in">
              <div style={{ marginBottom: 40 }}>
                <span
                  style={{
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  [ MODULE 02 ]
                </span>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: 36,
                    marginTop: 10,
                    marginBottom: 20,
                    fontFamily: "var(--font-slab)",
                    fontWeight: "900",
                  }}
                >
                  Quy trình Sáng tạo
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Phương thức "Prompt Engineering" được áp dụng để duy trì tính
                  Đảng và tính Khoa học trong từng pixel.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 30 }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      background: "#0a0a0c",
                      padding: "30px",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      borderLeft: "4px solid #4CAF50",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 15,
                        borderBottom: "1px solid #222",
                        paddingBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#ff5f56",
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#ffbd2e",
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#27c93f",
                        }}
                      />
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 10,
                          color: "#666",
                          fontFamily: "monospace",
                        }}
                      >
                        terminal --visual-engine
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#4CAF50",
                        fontWeight: "900",
                        marginBottom: 15,
                      }}
                    >
                      &gt; EXECUTING_VISUAL_PROMPT
                    </div>
                    <code
                      style={{
                        fontSize: 14,
                        display: "block",
                        marginBottom: 20,
                        color: "#ececec",
                        lineHeight: 1.6,
                        fontFamily: "monospace",
                      }}
                    >
                      "Industrial Marxist factory, 2030, iron beams, holographic
                      red flags, cinematic depth of field, sharp neon accents,
                      8k resolution, data-driven aesthetics --ar 16:9"
                    </code>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                        borderTop: "1px solid #222",
                        paddingTop: 15,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ color: "#27c93f" }}>✓ COMPLETE:</span> Toàn
                      bộ môi trường Game được thiết lập theo phong cách này.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#0a0a0c",
                    padding: "30px",
                    borderRadius: "8px",
                    border: "1px solid #333",
                    borderLeft: "4px solid var(--primary)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 15,
                      borderBottom: "1px solid #222",
                      paddingBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ff5f56",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ffbd2e",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#27c93f",
                      }}
                    />
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 10,
                        color: "#666",
                        fontFamily: "monospace",
                      }}
                    >
                      terminal --theory-compiler
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--primary)",
                      fontWeight: "900",
                      marginBottom: 15,
                    }}
                  >
                    &gt; COMPILING_THEORETICAL_FRAMEWORK
                  </div>
                  <code
                    style={{
                      fontSize: 14,
                      display: "block",
                      marginBottom: 20,
                      color: "#ececec",
                      lineHeight: 1.6,
                      fontFamily: "monospace",
                    }}
                  >
                    "Analyze Marx's Theory of Surplus Value. How would a gig
                    economy worker in 2030 perceive the alienation of labor?
                    Generate game mechanincs based on (c+v+m)."
                  </code>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      borderTop: "1px solid #222",
                      paddingTop: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "var(--primary)" }}>✓ COMPILED:</span>{" "}
                    Cơ sở dữ liệu cho các trận chiến lý luận và chỉ số kinh tế.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "theory" && (
            <div className="scale-in">
              <div style={{ marginBottom: 40 }}>
                <span
                  style={{
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  [ MODULE 03 ]
                </span>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: 36,
                    marginTop: 10,
                    marginBottom: 20,
                    fontFamily: "var(--font-slab)",
                    fontWeight: "900",
                  }}
                >
                  AI dưới lăng kính Mác-xít
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Phân tích bản chất của công cụ AI dựa trên Chương 6: Giá trị
                  thặng dư.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {[
                  {
                    title: "Tư bản bất biến (c)",
                    content:
                      "AI và Robot chỉ là 'lao động quá khứ'. Chúng không thể tự bóc lột chính mình hay tạo ra giá trị mới mà chỉ chuyển dịch giá trị bản thân vào sản phẩm qua khấu hao. Nếu không có bàn tay con người vận hành, chúng chỉ là đống sắt vụn.",
                    color: "#3b82f6",
                    tag: "CONSTANT_CAPITAL",
                  },
                  {
                    title: "Lao động sống (v)",
                    content:
                      "Nguồn gốc duy nhất của thặng dư. Trong các hệ thống tự động, lao động sống của đội ngũ kỹ sư, lập trình viên và người điều hành chính là thực thể tạo ra giá trị mới (v + m), duy trì sự tồn tại của hệ thống kinh tế.",
                    color: "#ef4444",
                    tag: "LIVING_LABOR",
                  },
                  {
                    title: "Thặng dư tương đối",
                    content:
                      "AI làm tăng năng suất xã hội, rút ngắn thời gian lao động tất yếu để kéo dài thời gian lao động thặng dư. Đây là cách các tập đoàn Big Tech thu lợi nhuận khổng lồ trong kỷ nguyên số thông qua việc chiếm lĩnh thị trường và lợi nhuận siêu ngạch.",
                    color: "#10b981",
                    tag: "SURPLUS_VALUE",
                  },
                  {
                    title: "Chiến lược Nhân lực VN",
                    content:
                      "Chuyển dịch từ 'Thâm dụng cơ bắp' sang 'Thâm dụng tri thức'. Việt Nam tập trung đào tạo lao động phức tạp trong các ngành mũi nhọn (Bán dẫn, AI) để người lao động đóng vai trò là 'chủ thể điều khiển trí tuệ' thay vì chỉ là mắt xích cơ khí.",
                    color: "#f59e0b",
                    tag: "VIETNAM_2030",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      padding: "30px",
                      borderRadius: "4px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -10,
                        top: -10,
                        fontSize: 80,
                        opacity: 0.03,
                        fontWeight: "900",
                      }}
                    >
                      0{i + 1}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        marginBottom: 15,
                      }}
                    >
                      <div
                        style={{
                          padding: "4px 10px",
                          background: item.color,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: "900",
                          borderRadius: "2px",
                        }}
                      >
                        {item.tag}
                      </div>
                      <h4
                        style={{
                          color: item.color,
                          margin: 0,
                          fontSize: 20,
                          fontWeight: "900",
                          fontFamily: "var(--font-slab)",
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.8)",
                        margin: 0,
                      }}
                    >
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "transparency" && (
            <div
              className="scale-in"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  fontSize: 100,
                  marginBottom: 30,
                  color: "var(--primary)",
                  filter: "drop-shadow(0 0 20px rgba(165, 28, 48, 0.5))",
                }}
              >
                🛡️
              </motion.div>
              <h3
                style={{
                  color: "#fff",
                  fontSize: 32,
                  marginBottom: 20,
                  fontFamily: "var(--font-slab)",
                  fontWeight: "900",
                }}
              >
                Cam kết Tính Nhân bản
              </h3>
              <div
                style={{
                  width: 60,
                  height: 4,
                  background: "var(--primary)",
                  marginBottom: 30,
                }}
              />
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 600,
                  margin: "0 auto 40px",
                }}
              >
                Dự án này là minh chứng cho sự cộng sinh giữa Trí tuệ Nhân tạo
                và Thực tiễn Lý luận. Chúng tôi khẳng định mọi định hướng nội
                dung, cấu trúc logic và linh hồn của trò chơi đều được kiểm soát
                và phê duyệt trực tiếp bởi đội ngũ sinh viên.
              </p>

              <div style={{ display: "flex", gap: 20 }}>
                <div
                  style={{
                    padding: "15px 30px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--primary)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--primary)",
                      fontWeight: "900",
                      marginBottom: 5,
                    }}
                  >
                    DEVELOPMENT PROTOCOL
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}
                  >
                    HUMAN-IN-THE-LOOP
                  </div>
                </div>
                <div
                  style={{
                    padding: "15px 30px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--primary)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--primary)",
                      fontWeight: "900",
                      marginBottom: 5,
                    }}
                  >
                    ETHICAL COMPLIANCE
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}
                  >
                    MARXIST DATA ETHICS
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 60,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: "bold",
                  letterSpacing: 3,
                }}
              >
                ESTABLISHED 2026 // PROJECT: GIAC NGO SO
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIToolsScreen({ onFinish }: { onFinish: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "process" | "theory" | "transparency"
  >("overview");

  const tabs = [
    { id: "overview", label: "TỔNG QUAN", icon: "◈" },
    { id: "process", label: "QUY TRÌNH", icon: "▣" },
    { id: "theory", label: "HỌC THUẬT", icon: "△" },
    { id: "transparency", label: "CAM KẾT", icon: "✦" },
  ] as const;

  const metrics = [
    {
      label: "Vai trò AI",
      value: "Hỗ trợ có kiểm soát",
      detail: "Không thay thế tư duy học thuật",
      color: "#7dd3fc",
    },
    {
      label: "Kiểm duyệt",
      value: "100% bởi nhóm",
      detail: "Đọc lại, sửa tay, test lại",
      color: "#fca5a5",
    },
    {
      label: "Đầu ra cuối",
      value: "Do nhóm xác nhận",
      detail: "Nội dung, trình bày, mã nguồn",
      color: "#86efac",
    },
    {
      label: "Mục tiêu",
      value: "Minh bạch sử dụng AI",
      detail: "Nói rõ mức độ và trách nhiệm",
      color: "#fcd34d",
    },
  ];

  const overviewCards = [
    {
      name: "Lên ý tưởng và xây khung",
      role: "Bản nháp khởi tạo",
      desc: "AI hỗ trợ gợi ý cấu trúc màn chơi, nhịp kể chuyện, dạng câu hỏi và một số hướng triển khai phù hợp với chủ đề lao động trong kỷ nguyên AI.",
      color: "#7dd3fc",
      icon: "01",
    },
    {
      name: "Biên tập nội dung",
      role: "Ngôn ngữ và bố cục",
      desc: "AI hỗ trợ soạn nháp lời dẫn, câu mô tả và các diễn giải bạn đầu. Nhóm chỉnh sửa lại để đúng tinh thần học phần, gọn hơn và ít khoa trương hơn.",
      color: "#fca5a5",
      icon: "02",
    },
    {
      name: "Hỗ trợ kỹ thuật",
      role: "React và UI",
      desc: "AI được dùng để đề xuất cách tổ chức component, animation, state và giao diện. Phần tích hợp, chọn giải pháp cuối và sửa lỗi vẫn do nhóm thực hiện.",
      color: "#86efac",
      icon: "03",
    },
    {
      name: "Rà soát hoàn thiện",
      role: "Kiểm tra nhiều vòng",
      desc: "AI hỗ trợ phát hiện chỗ diễn đạt dài, ý trùng hoặc giao diện chưa rõ. Nhóm tự đối chiếu, chơi thử và chốt phiên bản cuối cùng để nộp.",
      color: "#fcd34d",
      icon: "04",
    },
  ];

  const processSteps = [
    {
      id: "01",
      title: "Chốt mục tiêu trước khi dùng AI",
      text: "Nhóm xác định rõ từng màn phải giúp người học hiểu nội dung gì trước khi dùng AI, để công cụ chỉ hỗ trợ triển khai chứ không dẫn dắt sai định hướng.",
      color: "#7dd3fc",
    },
    {
      id: "02",
      title: "Dùng AI để sinh gợi ý bạn đầu",
      text: "Nhóm dùng AI cho phần brainstorming, dàn ý, diễn đạt bạn đầu hoặc hỗ trợ kỹ thuật. Mọi đầu ra nhận được đều được xem là bản nháp, không dùng nguyên trạng.",
      color: "#fca5a5",
    },
    {
      id: "03",
      title: "Đối chiếu với bài giảng và logic game",
      text: "Nhóm đọc lại nội dung AI gợi ý, đối chiếu với lý thuyết của môn và cách vận hành của game để loại bỏ những chỗ suy diễn, rườm rà hoặc thiếu chính xác.",
      color: "#86efac",
    },
    {
      id: "04",
      title: "Viết lại và tích hợp thủ công",
      text: "Những phần được giữ lại đều được nhóm viết lại, rút gọn, đổi giọng điệu và đưa vào sản phẩm bằng thao tác lập trình thủ công để giữ tính nhất quán.",
      color: "#fcd34d",
    },
    {
      id: "05",
      title: "Kiểm thử và chịu trách nhiệm",
      text: "Phiên bản cuối cùng được nhóm tự test lại về logic, trải nghiệm và độ đúng học thuật. Nhóm sinh viên là bên chịu trách nhiệm hoàn toàn với nội dung và mã nguồn nộp.",
      color: "#c4b5fd",
    },
  ];

  const theoryCards = [
    {
      title: "AI là công cụ hỗ trợ",
      content:
        "Trong dự án này, AI không tự xác lập mục tiêu giáo dục và cũng không tự quyết định luận điểm. Nó chỉ hỗ trợ tăng tốc ở giai đoạn bản nháp.",
      color: "#7dd3fc",
      tag: "SUPPORT_TOOL",
    },
    {
      title: "Giá trị nằm ở khâu chọn lọc",
      content:
        "Điểm quan trọng không phải AI tạo ra bao nhiêu chữ, mà là nhóm đã đọc, bác bỏ, chỉnh sửa và chuyển hóa những gợi ý đó thành sản phẩm phù hợp với học phần ra sao.",
      color: "#fca5a5",
      tag: "HUMAN_JUDGMENT",
    },
    {
      title: "AI tăng năng suất, không miễn trừ trách nhiệm",
      content:
        "AI có thể giúp tiết kiệm thời gian viết nháp và thử nghiệm giao diện, nhưng nếu không có kiểm chứng thì rất dễ tạo ra nội dung sai, thiếu nguồn hoặc diễn giải quá mức.",
      color: "#86efac",
      tag: "CRITICAL_USE",
    },
    {
      title: "Phụ lục AI nhằm mục tiêu minh bạch",
      content:
        "Phần phụ lục này giúp nói rõ AI đã được dùng ở mức nào, quy trình kiểm soát chất lượng ra sao và đâu là phần đóng góp thực tế của nhóm sinh viên.",
      color: "#fcd34d",
      tag: "DISCLOSURE",
    },
  ];

  const transparencyPoints = [
    "AI được dùng để gợi ý, phác thảo và hỗ trợ kỹ thuật, không thay thế toàn bộ tư duy học thuật của nhóm.",
    "Mọi nội dung liên quan đến lý luận, lao động, giá trị và vai trò của AI đều được nhóm đọc lại, chỉnh sửa và xác nhận.",
    "Kết quả từ AI không được xem là nguồn trích dẫn học thuật, mà chỉ là công cụ hỗ trợ xây dựng bản nháp.",
    "Mọi quyết định cuối cùng về nội dung, hình thức trình bày và mã nguồn đều do nhóm sinh viên chịu trách nhiệm.",
  ];

  const renderSectionHeader = (
    code: string,
    title: string,
    description: string,
  ) => (
    <div style={{ marginBottom: 34 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "var(--primary)",
          fontSize: 11,
          fontWeight: "900",
          letterSpacing: 2,
          marginBottom: 18,
        }}
      >
        <span>{code}</span>
        <span style={{ width: 24, height: 1, background: "var(--primary)" }} />
        <span>AI APPENDIX</span>
      </div>
      <h3
        style={{
          color: "#fff",
          fontSize: 36,
          margin: 0,
          marginBottom: 14,
          fontFamily: "var(--font-slab)",
          fontWeight: "900",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "rgba(255,255,255,0.68)",
          fontSize: 15,
          lineHeight: 1.7,
          margin: 0,
          maxWidth: 720,
        }}
      >
        {description}
      </p>
    </div>
  );

  return (
    <div
      className="industrial-container"
      style={{
        maxWidth: 1150,
        margin: "0 auto",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <div
        className="glass-industrial"
        style={{
          display: "flex",
          flexWrap: "wrap",
          minHeight: 720,
          border: "1px solid var(--primary)",
          overflow: "hidden",
          padding: 0,
          boxShadow:
            "0 0 40px rgba(0,0,0,0.5), inset 0 0 100px rgba(165, 28, 48, 0.05)",
        }}
      >
        <div
          style={{
            flex: "0 0 300px",
            minWidth: 280,
            background:
              "linear-gradient(180deg, rgba(18,18,24,0.98) 0%, rgba(7,7,10,1) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            padding: "40px 0",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 8,
              opacity: 0.3,
              letterSpacing: 2,
              color: "var(--primary)",
            }}
          >
            DISCLOSURE_MATRIX_V2
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              width: 2,
              height: 40,
              background: "var(--primary)",
              opacity: 0.5,
            }}
          />

          <div style={{ padding: "0 40px", marginBottom: 50 }}>
            <div
              style={{
                color: "var(--primary)",
                fontWeight: "900",
                fontSize: 11,
                letterSpacing: 4,
                marginBottom: 8,
                opacity: 0.8,
              }}
            >
              APPENDIX
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: "900",
                fontFamily: "var(--font-slab)",
                margin: 0,
                color: "#fff",
                textShadow: "2px 2px 0 var(--primary)",
              }}
            >
              PHỤ LỤC AI
            </h2>
            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                color: "rgba(255,255,255,0.58)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Bản trình bày minh bạch về cách nhóm sử dụng AI trong quá trình
              xây dựng sản phẩm.
            </p>
            <div
              style={{
                height: 2,
                width: 40,
                background: "var(--primary)",
                marginTop: 15,
              }}
            />
          </div>

          <div
            style={{
              margin: "0 28px 28px",
              padding: 18,
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(165,28,48,0.16) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.48)",
                fontSize: 10,
                letterSpacing: 2,
                fontWeight: "900",
                marginBottom: 8,
              }}
            >
              LIVE STATUS
            </div>
            <div
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Human-in-the-loop
            </div>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.68)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Mọi đầu ra từ AI đều đi qua bước đọc lại, chỉnh sửa và xác nhận
              bởi nhóm trước khi xuất hiện trong game.
            </p>
          </div>

          <div style={{ flex: 1 }}>
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                whileHover={{ x: 6, background: "rgba(255,255,255,0.03)" }}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "18px 36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background:
                    activeTab === tab.id
                      ? "rgba(165, 28, 48, 0.15)"
                      : "transparent",
                  borderLeft:
                    activeTab === tab.id
                      ? "5px solid var(--primary)"
                      : "5px solid transparent",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                }}
              >
                {activeTab === tab.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 20,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      boxShadow: "0 0 10px var(--primary)",
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 18,
                    width: 26,
                    textAlign: "center",
                    filter:
                      activeTab === tab.id
                        ? "none"
                        : "grayscale(1) opacity(0.5)",
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  {tab.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: "0 30px" }}>
            <button
              onClick={onFinish}
              className="btn-primary"
              style={{
                width: "100%",
                fontSize: 13,
                padding: "18px",
                borderRadius: "12px",
                background: "linear-gradient(45deg, #a51c30 0%, #7a1524 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 30px rgba(165, 28, 48, 0.2)",
              }}
            >
              HÀNH TRÌNH TIẾP TỤC →
            </button>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 620px",
            minWidth: 0,
            background:
              "radial-gradient(circle at top right, rgba(165,28,48,0.16), transparent 32%), rgba(18, 18, 22, 0.72)",
            padding: "42px",
            overflowY: "auto",
            maxHeight: 720,
            scrollbarWidth: "thin",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.08))",
            }}
          />

          {activeTab === "overview" && (
            <div className="scale-in">
              {renderSectionHeader(
                "MODULE 01",
                "Phạm vi sử dụng AI trong dự án",
                "Phụ lục này không nhằm phô trương công cụ, mà để mô tả rõ AI đã hỗ trợ ở đâu, mức độ ra sao và phần nào vẫn do nhóm trực tiếp chịu trách nhiệm trong quá trình hoàn thiện sản phẩm.",
              )}

              <div
                style={{
                  position: "relative",
                  padding: 30,
                  borderRadius: 24,
                  marginBottom: 24,
                  background:
                    "linear-gradient(135deg, rgba(165,28,48,0.22) 0%, rgba(255,255,255,0.04) 42%, rgba(125,211,252,0.08) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  boxShadow: "0 26px 50px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -80,
                    top: -80,
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    filter: "blur(10px)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 24,
                    alignItems: "end",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 12px",
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.24)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "900",
                        letterSpacing: 1.5,
                        marginBottom: 16,
                      }}
                    >
                      <span style={{ color: "#fda4af" }}>■</span>
                      <span>AI USE DISCLOSURE</span>
                    </div>
                    <h4
                      style={{
                        margin: 0,
                        color: "#fff",
                        fontSize: 34,
                        lineHeight: 1.05,
                        fontWeight: "900",
                        fontFamily: "var(--font-slab)",
                        marginBottom: 14,
                      }}
                    >
                      AI là trợ lý tăng tốc, không phải người quyết định thay
                      nhóm.
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.74)",
                        fontSize: 15,
                        lineHeight: 1.75,
                        maxWidth: 520,
                      }}
                    >
                      Mọi nội dung cuối cùng xuất hiện trong game đều đi qua quá
                      trình chọn lọc, viết lại, kiểm tra và xác nhận bởi nhóm
                      sinh viên.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      background: "rgba(8,8,12,0.4)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        fontWeight: "900",
                        letterSpacing: 2,
                        marginBottom: 12,
                      }}
                    >
                      CORE PRINCIPLES
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      {[
                        "Có người kiểm duyệt ở mọi vòng",
                        "Không dùng AI như nguồn trích dẫn",
                        "Nhóm chịu trách nhiệm với đầu ra cuối",
                      ].map((item) => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            color: "rgba(255,255,255,0.8)",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ color: "var(--primary)" }}>▸</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                    }}
                  >
                    <div
                      style={{
                        color: metric.color,
                        fontSize: 11,
                        fontWeight: "900",
                        letterSpacing: 1.5,
                        marginBottom: 12,
                      }}
                    >
                      {metric.label.toUpperCase()}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: "900",
                        lineHeight: 1.25,
                        marginBottom: 10,
                      }}
                    >
                      {metric.value}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {metric.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 24,
                }}
              >
                {overviewCards.map((card) => (
                  <motion.div
                    key={card.name}
                    whileHover={{ y: -6, scale: 1.01 }}
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)",
                      padding: "28px",
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderTop: `3px solid ${card.color}`,
                      transition: "all 0.3s ease",
                      boxShadow: "0 18px 30px rgba(0,0,0,0.12)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 15,
                      }}
                    >
                      <span
                        style={{
                          width: 52,
                          height: 52,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.06)",
                          color: card.color,
                          fontWeight: "900",
                          fontSize: 18,
                          letterSpacing: 1,
                        }}
                      >
                        {card.icon}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: 18,
                            lineHeight: 1.3,
                          }}
                        >
                          {card.name}
                        </div>
                        <div
                          style={{
                            color: card.color,
                            fontSize: 10,
                            fontWeight: "900",
                            letterSpacing: 1,
                            marginTop: 4,
                          }}
                        >
                          {card.role.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.8,
                        margin: 0,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: "500",
                      }}
                    >
                      {card.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "process" && (
            <div className="scale-in">
              {renderSectionHeader(
                "MODULE 02",
                "Quy trình sử dụng AI",
                "AI chỉ là một bước hỗ trợ trong chuỗi làm việc có kiểm chứng. Nhóm giữ vai trò chọn lọc, sửa lại, tích hợp và phê duyệt đầu ra cuối cùng trước khi đưa vào game.",
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
                    padding: "24px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "4px solid #7dd3fc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 15,
                      borderBottom: "1px solid #222",
                      paddingBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ff5f56",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ffbd2e",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#27c93f",
                      }}
                    />
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 10,
                        color: "#666",
                        fontFamily: "monospace",
                      }}
                    >
                      workflow --content-drafting
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7dd3fc",
                      fontWeight: "900",
                      marginBottom: 15,
                    }}
                  >
                    &gt; GENERATING_FIRST_DRAFT
                  </div>
                  <code
                    style={{
                      fontSize: 14,
                      display: "block",
                      marginBottom: 20,
                      color: "#ececec",
                      lineHeight: 1.6,
                      fontFamily: "monospace",
                    }}
                  >
                    "Hãy gợi ý cấu trúc cho một game học tập về kinh tế chính
                    trị Mác - Lênin, trong đó người học phải phân biệt vai trò
                    của lao động sống, máy móc và AI trong quá trình tạo ra giá
                    trị."
                  </code>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      borderTop: "1px solid #222",
                      paddingTop: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "#7dd3fc" }}>✓ OUTPUT:</span> Nhóm chỉ
                    lấy ý tưởng phù hợp, sau đó viết lại theo mục tiêu bài học.
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
                    padding: "24px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "4px solid var(--primary)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 15,
                      borderBottom: "1px solid #222",
                      paddingBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ff5f56",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ffbd2e",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#27c93f",
                      }}
                    />
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 10,
                        color: "#666",
                        fontFamily: "monospace",
                      }}
                    >
                      workflow --code-review
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--primary)",
                      fontWeight: "900",
                      marginBottom: 15,
                    }}
                  >
                    &gt; REFINING_UI_AND_LOGIC
                  </div>
                  <code
                    style={{
                      fontSize: 14,
                      display: "block",
                      marginBottom: 20,
                      color: "#ececec",
                      lineHeight: 1.6,
                      fontFamily: "monospace",
                    }}
                  >
                    "Kiểm tra component này có đoạn nào dài dòng, lặp ý, khó
                    hiểu với sinh viên năm nhất hoặc dễ phát sinh lỗi state khi
                    chuyển màn. Đề xuất cách sửa nhưng giữ nguyên định hướng học
                    thuật của nhóm."
                  </code>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      borderTop: "1px solid #222",
                      paddingTop: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "var(--primary)" }}>✓ REVIEWED:</span>{" "}
                    Mọi gợi ý chỉ được áp dụng sau khi nhóm tự đọc lại, sửa tay
                    và chạy thử trong sản phẩm.
                  </div>
                </div>

                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 17,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
                    }}
                  />
                  {processSteps.map((step) => (
                    <div
                      key={step.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px 1fr",
                        gap: 18,
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#0d0d11",
                          border: `2px solid ${step.color}`,
                          color: step.color,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          fontWeight: "900",
                          position: "relative",
                          zIndex: 1,
                          boxShadow: "0 0 0 8px rgba(10,10,12,0.95)",
                        }}
                      >
                        {step.id}
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderTop: `3px solid ${step.color}`,
                          borderRadius: "18px",
                          padding: "22px",
                        }}
                      >
                        <div
                          style={{
                            color: step.color,
                            fontSize: 11,
                            fontWeight: "900",
                            letterSpacing: 1.5,
                            marginBottom: 10,
                          }}
                        >
                          STEP {step.id}
                        </div>
                        <div
                          style={{
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: "800",
                            marginBottom: 10,
                          }}
                        >
                          {step.title}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "rgba(255,255,255,0.72)",
                            lineHeight: 1.7,
                            fontSize: 14,
                          }}
                        >
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "theory" && (
            <div className="scale-in">
              {renderSectionHeader(
                "MODULE 03",
                "Ý nghĩa học thuật của việc dùng AI",
                "Nhóm tiếp cận AI như một công cụ hỗ trợ học tập và phát triển sản phẩm, không xem đó là một chủ thể thay thế trách nhiệm nghiên cứu hay tư duy phản biện.",
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 20,
                }}
              >
                {theoryCards.map((item, index) => (
                  <div
                    key={item.title}
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                      padding: "28px",
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 250,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -10,
                        top: -10,
                        fontSize: 80,
                        opacity: 0.03,
                        fontWeight: "900",
                      }}
                    >
                      0{index + 1}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: "auto -20% -40% auto",
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: `${item.color}18`,
                        filter: "blur(16px)",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        marginBottom: 15,
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 10px",
                          background: item.color,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: "900",
                          borderRadius: "2px",
                        }}
                      >
                        {item.tag}
                      </div>
                      <h4
                        style={{
                          color: item.color,
                          margin: 0,
                          fontSize: 20,
                          fontWeight: "900",
                          fontFamily: "var(--font-slab)",
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.8)",
                        margin: 0,
                      }}
                    >
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "transparency" && (
            <div
              className="scale-in"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {renderSectionHeader(
                "MODULE 04",
                "Cam kết minh bạch khi dùng AI",
                "Dự án có sử dụng AI, nhưng việc sử dụng được đặt trong phạm vi rõ ràng và luôn có người kiểm duyệt. Nhóm xem AI là công cụ hỗ trợ năng suất, không phải nguồn chân lý hay tác giả thay cho sinh viên.",
              )}

              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 24,
                  padding: 30,
                  background:
                    "linear-gradient(135deg, rgba(165,28,48,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(134,239,172,0.08) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.16)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -50,
                    top: -50,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    filter: "blur(10px)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 24,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: 34,
                        fontFamily: "var(--font-slab)",
                        fontWeight: "900",
                        lineHeight: 1.1,
                        marginBottom: 12,
                      }}
                    >
                      Nhóm công khai phạm vi dùng AI và vẫn giữ trách nhiệm học
                      thuật ở phía con người.
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(255,255,255,0.74)",
                        fontSize: 15,
                        lineHeight: 1.8,
                      }}
                    >
                      Công cụ có thể hỗ trợ năng suất, nhưng việc hiểu đúng môn
                      học, kiểm soát chất lượng và quyết định nội dung cuối cùng
                      vẫn thuộc về nhóm sinh viên.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {[
                      "Human reviewed",
                      "Course aligned",
                      "Scope disclosed",
                    ].map((stamp) => (
                      <div
                        key={stamp}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                          borderRadius: 14,
                          background: "rgba(12,12,16,0.38)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(255,255,255,0.75)",
                            fontSize: 13,
                            fontWeight: "700",
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                          }}
                        >
                          {stamp}
                        </span>
                        <span
                          style={{
                            color: "#86efac",
                            fontSize: 12,
                            fontWeight: "900",
                          }}
                        >
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {transparencyPoints.map((point, index) => (
                  <div
                    key={point}
                    style={{
                      padding: "18px 20px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      textAlign: "left",
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1.7,
                      fontSize: 14,
                      boxShadow: "0 14px 24px rgba(0,0,0,0.12)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--primary)",
                        fontWeight: "900",
                        marginRight: 8,
                      }}
                    >
                      0{index + 1}
                    </span>
                    {point}
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 22,
                  borderRadius: 18,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--primary)",
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  FINAL DECLARATION
                </div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: "900",
                    fontFamily: "var(--font-slab)",
                    lineHeight: 1.25,
                  }}
                >
                  AI được dùng như công cụ hỗ trợ có giới hạn. Trách nhiệm cuối
                  cùng vẫn thuộc về nhóm thực hiện dự án.
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.36)",
                    fontWeight: "bold",
                    letterSpacing: 3,
                    marginTop: 4,
                  }}
                >
                  DISCLOSURE APPENDIX // PROJECT: GIAC NGO SO
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════ AI USAGE APPENDIX SCREEN ═══════════════════

function AIUsageScreen({
  character,
  onStart,
}: {
  character: Character | null;
  onStart: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "process" | "theory" | "transparency"
  >("overview");

  const tabs = [
    { id: "overview", label: "TỔNG QUAN", icon: "◈" },
    { id: "process", label: "QUY TRÌNH", icon: "▣" },
    { id: "theory", label: "HỌC THUẬT", icon: "△" },
    { id: "transparency", label: "CAM KẾT", icon: "✦" },
  ] as const;

  const overviewCards = [
    {
      name: "Lên ý tưởng & xây khung",
      role: "Bản nháp khởi tạo",
      desc: "AI hỗ trợ gợi ý cấu trúc màn chơi, nhịp kể chuyện, dạng câu hỏi phù hợp với chủ đề lao động trong kỷ nguyên AI.",
      color: "#7dd3fc",
      icon: "01",
    },
    {
      name: "Biên tập nội dung",
      role: "Ngôn ngữ & bố cục",
      desc: "AI hỗ trợ soạn nháp lời dẫn, câu mô tả. Nhóm chỉnh sửa để đúng tinh thần học phần, gọn hơn và ít khoa trương.",
      color: "#fca5a5",
      icon: "02",
    },
    {
      name: "Hỗ trợ kỹ thuật",
      role: "React & UI",
      desc: "AI được dùng để đề xuất component, animation, state. Nhóm tích hợp, chọn giải pháp cuối và sửa lỗi.",
      color: "#86efac",
      icon: "03",
    },
    {
      name: "Rà soát hoàn thiện",
      role: "Kiểm tra nhiều vòng",
      desc: "AI hỗ trợ phát hiện diễn đạt dài, ý trùng. Nhóm tự đối chiếu, chơi thử và chốt phiên bản cuối.",
      color: "#fcd34d",
      icon: "04",
    },
  ];

  const processSteps = [
    {
      id: "01",
      title: "Chốt mục tiêu học tập trước khi dùng AI",
      text: "Nhóm xác định rõ từng module phải giúp người học hiểu nội dung gì (lao động, giá trị, thặng dư...) trước khi dùng AI.",
      color: "#7dd3fc",
    },
    {
      id: "02",
      title: "Dùng AI để sinh gợi ý bạn đầu",
      text: "Nhóm dùng AI cho brainstorming, dàn ý, diễn đạt nháp. Mọi đầu ra được xem là bản nháp, không dùng nguyên trạng.",
      color: "#fca5a5",
    },
    {
      id: "03",
      title: "Đối chiếu với lý thuyết Mác & logic game",
      text: "Nhóm đọc lại nội dung AI, đối chiếu với bài giảng để loại bỏ suy diễn sai, rườm rà hoặc thiếu chính xác.",
      color: "#86efac",
    },
    {
      id: "04",
      title: "Viết lại & tích hợp thủ công",
      text: "Những phần được giữ lại đều được nhóm viết lại, rút gọn, đổi giọng và đưa vào bằng thao tác lập trình thủ công.",
      color: "#fcd34d",
    },
    {
      id: "05",
      title: "Kiểm thử & chịu trách nhiệm",
      text: "Phiên bản cuối được nhóm tự test về logic, trải nghiệm và độ đúng học thuật. Nhóm chịu trách nhiệm hoàn toàn.",
      color: "#c4b5fd",
    },
  ];

  const theoryCards = [
    {
      title: "AI là công cụ hỗ trợ, không phải sáng tạo",
      content:
        "Trong dự án này, AI không tự xác lập mục tiêu giáo dục cũng không tự quyết định luận điểm. Nó chỉ hỗ trợ tăng tốc ở giai đoạn bản nháp.",
      color: "#7dd3fc",
      tag: "SUPPORT_TOOL",
    },
    {
      title: "Giá trị nằm ở khâu chọn lọc & biên tập",
      content:
        "Điểm quan trọng không phải AI tạo bao nhiêu chữ, mà là nhóm đã đọc, bác bỏ, chỉnh sửa và chuyển hóa gợi ý thành sản phẩm phù hợp.",
      color: "#fca5a5",
      tag: "HUMAN_JUDGMENT",
    },
    {
      title: "AI không miễn trừ trách nhiệm",
      content:
        "AI giúp tiết kiệm thời gian viết nháp, nhưng nếu không kiểm chứng thì dễ tạo nội dung sai, thiếu nguồn hoặc diễn giải quá mức.",
      color: "#86efac",
      tag: "CRITICAL_USE",
    },
    {
      title: "Minh bạch là trách nhiệm của nhóm",
      content:
        "Phần này giúp nói rõ AI đã được dùng ở mức nào, quy trình kiểm soát như thế nào và đâu là đóng góp thực tế của nhóm.",
      color: "#fcd34d",
      tag: "DISCLOSURE",
    },
  ];

  const transparencyPoints = [
    "AI được dùng để gợi ý, phác thảo và hỗ trợ kỹ thuật, không thay thế toàn bộ tư duy học thuật của nhóm.",
    "Mọi nội dung về lý luận Mác, lao động, giá trị, thặng dư đều được nhóm đọc lại, chỉnh sửa và xác nhận.",
    "Kết quả từ AI không được xem là nguồn trích dẫn học thuật, chỉ là công cụ hỗ trợ xây bản nháp.",
    "Mọi quyết định cuối cùng về nội dung, hình thức và mã nguồn đều do nhóm sinh viên chịu trách nhiệm.",
  ];

  const renderSectionHeader = (
    code: string,
    title: string,
    description: string,
  ) => (
    <div style={{ marginBottom: 34 }}>
      <div
        style={{
          display: "inline-block",
          background: "var(--primary)",
          color: "white",
          padding: "6px 14px",
          fontSize: 10,
          fontWeight: "900",
          marginBottom: 16,
          borderRadius: 2,
          letterSpacing: 1,
        }}
      >
        {code}
      </div>
      <h2
        style={{
          fontSize: 32,
          fontWeight: "900",
          margin: "0 0 12px 0",
          color: "var(--primary)",
          textTransform: "uppercase",
          fontFamily: "var(--font-slab)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--foreground)",
          opacity: 0.7,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );

  return (
    <div
      className="industrial-container"
      style={{
        maxWidth: 1150,
        margin: "0 auto",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <div
        className="glass-industrial"
        style={{
          display: "flex",
          flexWrap: "wrap",
          minHeight: 720,
          border: "1px solid var(--primary)",
          overflow: "hidden",
          padding: 0,
          boxShadow:
            "0 0 40px rgba(0,0,0,0.5), inset 0 0 100px rgba(165, 28, 48, 0.05)",
        }}
      >
        {/* Sidebar Navigation */}
        <div
          style={{
            width: 240,
            background: "rgba(0,0,0,0.1)",
            borderRight: "1px solid var(--border)",
            padding: "32px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "14px 20px",
                border: "none",
                background:
                  activeTab === tab.id ? "var(--primary)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--foreground)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.2s",
                opacity: activeTab === tab.id ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = "rgba(165, 28, 48, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: 14, marginRight: 8 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: "48px 52px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 140px)",
          }}
        >
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderSectionHeader(
                "01",
                "Tổng Quan",
                "Cách AI được tích hợp vào quá trình phát triển dự án",
              )}

              <div style={{ marginTop: 40, marginBottom: 40 }}>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "var(--foreground)",
                    opacity: 0.9,
                  }}
                >
                  Dự án <strong>"Giác Ngộ Số"</strong> là một trò chơi nhập vai
                  duy tân học Mác kết hợp lý thuyết kinh tế chính trị với trải
                  nghiệm tương tác. Trong quá trình phát triển, AI được sử dụng
                  như một <strong>công cụ hỗ trợ</strong> ở các khâu lên ý
                  tưởng, biên tập nội dung và phát triển kỹ thuật, nhưng{" "}
                  <strong>không thay thế</strong> tư duy học thuật và quyết định
                  cuối cùng của nhóm.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {overviewCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: 24,
                      background: `${card.color}15`,
                      border: `2px solid ${card.color}`,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: "900",
                        color: card.color,
                        marginBottom: 8,
                      }}
                    >
                      {card.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: "900",
                        margin: "0 0 4px 0",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        color: "var(--primary)",
                      }}
                    >
                      {card.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 10,
                        color: card.color,
                        fontWeight: "700",
                        margin: "0 0 12px 0",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {card.role}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--foreground)",
                        opacity: 0.8,
                        margin: 0,
                      }}
                    >
                      {card.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "process" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderSectionHeader(
                "02",
                "Quy Trình",
                "5 bước kiểm soát chất lượng khi sử dụng AI",
              )}

              <div style={{ marginTop: 40 }}>
                {processSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      marginBottom: 24,
                      paddingLeft: 32,
                      borderLeft: `4px solid ${step.color}`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -16,
                        top: 0,
                        width: 28,
                        height: 28,
                        background: step.color,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "900",
                        fontSize: 12,
                      }}
                    >
                      {step.id}
                    </div>
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: "900",
                        margin: "0 0 8px 0",
                        color: "var(--primary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--foreground)",
                        opacity: 0.85,
                        margin: 0,
                      }}
                    >
                      {step.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "theory" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderSectionHeader(
                "03",
                "Học Thuật",
                "Những nguyên lý hướng dẫn cách sử dụng AI",
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  marginTop: 40,
                }}
              >
                {theoryCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: 24,
                      background: `${card.color}15`,
                      border: `2px solid ${card.color}`,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: "900",
                        color: card.color,
                        marginBottom: 12,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      {card.tag}
                    </div>
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: "900",
                        margin: "0 0 12px 0",
                        color: "var(--primary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--foreground)",
                        opacity: 0.85,
                        margin: 0,
                      }}
                    >
                      {card.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "transparency" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderSectionHeader(
                "04",
                "Cam Kết Minh Bạch",
                "Những cam kết của nhóm về sử dụng AI",
              )}

              <div style={{ marginTop: 40 }}>
                {transparencyPoints.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: "flex",
                      gap: 16,
                      marginBottom: 20,
                      padding: 16,
                      background: "rgba(165, 28, 48, 0.05)",
                      borderRadius: 6,
                      borderLeft: "4px solid var(--primary)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        background: "var(--primary)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "900",
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: "var(--foreground)",
                        opacity: 0.9,
                        margin: 0,
                      }}
                    >
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 40,
                  padding: 24,
                  background: "rgba(165, 28, 48, 0.1)",
                  border: "2px solid var(--primary)",
                  borderRadius: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: "var(--foreground)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  <strong>Kết luận:</strong> Phụ lục này nhằm mục tiêu tạo minh
                  bạch hoàn toàn về cách AI được sử dụng. Nhóm tin rằng việc
                  thừa nhận vai trò công cụ của AI và nêu rõ các khâu kiểm soát
                  chất lượng là trách nhiệm học thuật của mỗi dự án trong thời
                  đại số.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <motion.div
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={onStart}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontWeight: "800",
            fontSize: 14,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "14px 28px",
            background: "var(--primary)",
            border: "none",
            boxShadow:
              "0 4px 20px rgba(165, 28, 48, 0.3), 4px 4px 0 var(--secondary)",
            cursor: "pointer",
          }}
          whileHover={{
            y: -3,
            boxShadow:
              "0 8px 30px rgba(165, 28, 48, 0.4), 6px 6px 0 var(--secondary)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          Tiếp tục tới phần trò chơi
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}

function IntroSlidesScreen({
  slides,
  currentIndex,
  setCurrentIndex,
  onFinish,
}: {
  slides: IntroSlide[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  onFinish: () => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;
  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, var(--background) 0%, rgba(88, 86, 214, 0.05) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(88, 86, 214, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          top: "-200px",
          right: "-200px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(88, 86, 214, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          bottom: "-150px",
          left: "-150px",
          pointerEvents: "none",
        }}
      />

      {/* Header with slide counter */}
      <div
        style={{
          padding: "30px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(88, 86, 214, 0.2)",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: "900",
              color: "var(--primary)",
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            � Kinh Tế Chính Trị
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: "900",
                color: "var(--primary)",
              }}
            >
              GIỚI THIỆU {String(currentIndex + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--foreground)",
                opacity: 0.6,
                marginTop: 4,
              }}
            >
              {slides.length} giới thiệu
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: "rgba(88, 86, 214, 0.1)",
          position: "relative",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, var(--primary), rgba(88, 86, 214, 0.7))",
          }}
        />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 50px",
          position: "relative",
          zIndex: 5,
        }}
      >
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: 1200,
          }}
        >
          {/* Slide Title Section */}
          <div style={{ marginBottom: 50 }}>
            <div
              style={{
                display: "inline-block",
                background:
                  "linear-gradient(135deg, var(--primary), rgba(88, 86, 214, 0.8))",
                color: "white",
                padding: "8px 16px",
                fontSize: 11,
                fontWeight: "900",
                marginBottom: 20,
                borderRadius: 4,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Chuẩn Bị
            </div>
            <h1
              style={{
                fontSize: 56,
                fontFamily: "var(--font-slab)",
                margin: 0,
                lineHeight: 1.2,
                color: "var(--foreground)",
                fontWeight: "900",
              }}
            >
              {slide.title}
            </h1>
          </div>

          {/* Main content box */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Left column - Content */}
            <div>
              <div
                style={{
                  background: "rgba(88, 86, 214, 0.08)",
                  padding: "32px",
                  borderRadius: 12,
                  borderLeft: "4px solid var(--primary)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "var(--foreground)",
                    margin: 0,
                    opacity: 0.9,
                    fontWeight: 500,
                  }}
                >
                  {slide.content}
                </p>
              </div>
            </div>

            {/* Right column - Key Points */}
            {slide.keyPoints.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: "900",
                    color: "var(--primary)",
                    marginBottom: 20,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>◆</span>
                  Khái Niệm Cốt Lõi
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {slide.keyPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        padding: "12px",
                        background:
                          hoveredIndex === i
                            ? "rgba(88, 86, 214, 0.15)"
                            : "rgba(88, 86, 214, 0.05)",
                        borderRadius: 8,
                        border:
                          hoveredIndex === i
                            ? "1px solid rgba(88, 86, 214, 0.3)"
                            : "1px solid rgba(88, 86, 214, 0.15)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--primary)",
                          fontWeight: "900",
                          fontSize: 18,
                          minWidth: 24,
                        }}
                      >
                        ►
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.85,
                          fontWeight: 500,
                        }}
                      >
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer with navigation */}
      <div
        style={{
          padding: "30px 50px",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(88, 86, 214, 0.2)",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {/* Slide indicators */}
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrentIndex(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background:
                  i === currentIndex
                    ? "var(--primary)"
                    : "rgba(88, 86, 214, 0.3)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {currentIndex > 0 && (
            <motion.button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              onMouseEnter={() => setHoveredButton("back")}
              onMouseLeave={() => setHoveredButton(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "10px 20px",
                background:
                  hoveredButton === "back"
                    ? "rgba(88, 86, 214, 0.1)"
                    : "transparent",
                border:
                  hoveredButton === "back"
                    ? "1.5px solid rgba(88, 86, 214, 0.5)"
                    : "1.5px solid rgba(88, 86, 214, 0.3)",
                color: "var(--foreground)",
                fontSize: 13,
                fontWeight: "900",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.3s ease",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              ← Giới Thiệu Trước
            </motion.button>
          )}
          <motion.button
            onClick={() => {
              if (isLast) {
                onFinish();
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "10px 24px",
              background:
                "linear-gradient(135deg, var(--primary), rgba(88, 86, 214, 0.8))",
              color: "white",
              fontSize: 13,
              fontWeight: "900",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {isLast ? "Bắt Đầu Bài Học ➔" : "Giới Thiệu Tiếp ➔"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = React.useState(0);
  const [subtitle, setSubtitle] = React.useState("");
  const fullSubtitle =
    "Bước vào kỷ nguyên số, nơi thuật toán và tư bản giao thoa. Bạn sẽ là kẻ vận hành hay mắt xích bị bóc lột?";
  React.useEffect(() => {
    const p1 = setTimeout(() => setPhase(1), 500);
    const p2 = setTimeout(() => setPhase(2), 1500);
    const p3 = setTimeout(() => setPhase(3), 3000);
    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
    };
  }, []);
  React.useEffect(() => {
    if (phase >= 2 && subtitle.length < fullSubtitle.length) {
      const timeout = setTimeout(
        () => setSubtitle(fullSubtitle.slice(0, subtitle.length + 1)),
        30,
      );
      return () => clearTimeout(timeout);
    }
  }, [phase, subtitle]);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, var(--background) 0%, #d5c8b2 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-100px",
          bottom: "-100px",
          fontSize: 240,
          opacity: 0.03,
          animation: "spin 20s linear infinite",
          pointerEvents: "none",
        }}
      >
        ⚙
      </div>
      <div
        style={{
          position: "absolute",
          right: "-80px",
          top: "-80px",
          fontSize: 180,
          opacity: 0.03,
          animation: "spin 30s linear reverse infinite",
          pointerEvents: "none",
        }}
      >
        ⚙
      </div>
      <div
        style={{
          zIndex: 10,
          maxWidth: 1000,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ animation: "fade-in-down 1s ease-out" }}>
          <IndustrialBadge>
            Học liệu sáng tạo · MLN122 · Chương 6
          </IndustrialBadge>
        </div>
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0)" : "translateY(40px)",
            transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(42px, 8vw, 84px)",
              lineHeight: 0.9,
              margin: 0,
              color: "var(--primary)",
              textTransform: "uppercase",
              fontWeight: 900,
              fontFamily: "var(--font-slab)",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.35em",
                letterSpacing: 6,
                color: "var(--foreground)",
                marginBottom: 12,
                fontWeight: 700,
                opacity: 0.8,
              }}
            >
              HÀNH TRÌNH ĐI TÌM
            </span>
            GIÁC NGỘ SỐ
          </h1>
          <div
            style={{
              width: 120,
              height: 6,
              background: "var(--primary)",
              margin: "32px auto 0",
              boxShadow: "0 0 20px var(--primary)",
            }}
          />
        </div>
        <div
          style={{
            minHeight: 80,
            marginBottom: 60,
            maxWidth: 720,
            margin: "24px auto 48px",
          }}
        >
          <p
            style={{
              color: "var(--foreground)",
              fontSize: "clamp(16px, 2.5vw, 22px)",
              lineHeight: 1.6,
              fontWeight: 500,
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              opacity: phase >= 2 ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          >
            {subtitle}
            {phase === 2 && subtitle.length < fullSubtitle.length && (
              <span
                style={{
                  borderRight: "3px solid var(--primary)",
                  marginLeft: 4,
                  animation: "blink 0.8s step-end infinite",
                }}
              />
            )}
          </p>
        </div>
        <div
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
            marginTop: 60,
          }}
        >
          <button
            onClick={onStart}
            className="btn-primary"
            style={{
              padding: "24px 80px",
              fontSize: 22,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontFamily: "var(--font-slab)",
              borderRadius: "2px",
              borderWidth: "2px",
              boxShadow: "0 10px 30px rgba(165, 28, 48, 0.3)",
            }}
          >
            BẮT ĐẦU TRẢI NGHIỆM ➔
          </button>
          <DialecticQuoteStream />
        </div>
      </div>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const RulesView = ({ onContinue }: { onContinue: () => void }) => {
  const rules = [
    {
      title: "Kiến thức là Vũ khí",
      desc: "Sử dụng kiến thức Kinh tế chính trị để đưa ra lựa chọn đúng. Trả lời sai sẽ làm giảm các chỉ số quan trọng của bạn.",
    },
    {
      title: "Chiến lược Sinh tồn",
      desc: "Trong vai người lao động thời đại AI, bạn phải đối đầu với các tập đoàn công nghệ để bảo vệ quyền lợi và giá trị thặng dư.",
    },
    {
      title: "Quản trị Tài nguyên",
      desc: "Cân bằng 3 chỉ số cốt lõi: Tri thức, Sức khỏe và Tài chính. Thiếu hụt bất kỳ chỉ số nào cũng sẽ dẫn đến thất bại.",
    },
    {
      title: "Quyết định Vận mệnh",
      desc: "Mọi lựa chọn đều dẫn đến kết cục khác nhau. Bạn sẽ trở thành người làm chủ công nghệ hay nô lệ của thuật toán?",
    },
  ];
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background:
          'url("https://www.transparenttextures.com/patterns/carbon-fibre.png"), var(--background)',
      }}
    >
      <div
        className="glass-industrial"
        style={{
          maxWidth: 800,
          width: "100%",
          padding: 60,
          border: "1px solid var(--primary)",
          boxShadow: "20px 20px 0 var(--secondary)",
        }}
      >
        <h2
          style={{
            fontSize: 48,
            color: "var(--primary)",
            fontFamily: "var(--font-slab)",
            textTransform: "uppercase",
            margin: "0 0 40px 0",
            borderBottom: "4px solid var(--primary)",
            display: "inline-block",
          }}
        >
          Luật của Cuộc chơi
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
            marginBottom: 48,
          }}
        >
          {rules.map((rule, i) => (
            <div
              key={i}
              style={{
                borderLeft: "2px solid var(--primary)",
                paddingLeft: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  color: "var(--primary)",
                  fontWeight: 900,
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}
              >
                {i + 1}. {rule.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  opacity: 0.8,
                  color: "var(--foreground)",
                }}
              >
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={onContinue}
          className="btn-primary"
          style={{
            width: "100%",
            padding: 20,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          TÔI ĐÃ HIỂU, TIẾP TỤC ➔
        </button>
      </div>
    </div>
  );
};

// ═══════════════════ ECONOMIC MODULE COMPONENTS ═══════════════════

function ValueBars({ economy }: { economy: EconomyStats }) {
  const total = economy.c + economy.v + economy.m + economy.extraM;
  const pc = (economy.c / total) * 100;
  const pv = (economy.v / total) * 100;
  const pm = ((economy.m + economy.extraM) / total) * 100;

  return (
    <div style={{ marginBottom: 30 }}>
      <div
        style={{
          display: "flex",
          height: 40,
          border: "1px solid var(--border)",
          background: "var(--muted)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pc}%`,
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          c
        </div>
        <div
          style={{
            width: `${pv}%`,
            background: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          v
        </div>
        <div
          style={{
            width: `${pm}%`,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          m
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 11,
          fontWeight: "bold",
          color: "var(--foreground)",
          opacity: 0.8,
        }}
      >
        <span style={{ color: "#3b82f6" }}>
          c: Tư bản bất biến ({economy.c.toFixed(0)})
        </span>
        <span style={{ color: "#ef4444" }}>
          v: Tư bản khả biến ({economy.v.toFixed(0)})
        </span>
        <span style={{ color: "#22c55e" }}>
          m: Giá trị thặng dư ({(economy.m + economy.extraM).toFixed(0)})
        </span>
      </div>
    </div>
  );
}

// ═══════════════════ UTILITIES & HELPERS ═══════════════════

function useTypewriter(text: string, speed = 40, startDelay = 0) {
  const [displayed, setDisplayed] = React.useState("");
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(timer);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(timer);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

const DialecticQuoteStream = () => {
  const quotes = [
    "Công nghệ không xóa bỏ bóc lột, nó chỉ tinh vi hóa quá trình đó.",
    "Trong kỷ nguyên AI, lao động sống vẫn là nguồn duy nhất của giá trị thặng dư.",
    "Tư bản là lao động chết, giống như ma cà rồng, chỉ sống bằng cách hút lao động sống.",
    "Lực lượng sản xuất mới đòi hỏi một quan hệ sản xuất mới.",
  ];
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div
      style={{
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid rgba(165, 28, 48, 0.2)",
        marginTop: 40,
        paddingTop: 20,
        maxWidth: 600,
        margin: "40px auto 0",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--foreground)",
          opacity: 0.8,
          textAlign: "center",
        }}
      >
        "{quotes[index]}"
      </p>
    </div>
  );
};

const IndustrialBadge = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 16px",
      background: "var(--primary)",
      color: "white",
      fontSize: 11,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: 2,
      borderRadius: "2px",
      marginBottom: 24,
      boxShadow: "4px 4px 0 var(--secondary)",
    }}
  >
    <span style={{ fontSize: 14 }}>⚙</span>
    {children}
  </div>
);
