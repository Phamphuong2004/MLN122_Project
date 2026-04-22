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
}

interface StatEffect {
  knowledge?: number;
  willpower?: number;
  wealth?: number;
  social?: number;
  gem?: string;
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
    title: "Ngày Đầu Tiên",
    bgAccent: "var(--primary)",
    setting: "Nhà máy may mặc Sáng Nam · Bình Dương · Tháng 3/2025",
    narrative:
      'Buổi sáng tháng Ba, ánh nắng sớm lọc qua ô kính nhà máy. Bạn vừa nhận được công việc tại Sáng Nam – một trong những nhà máy may mặc lớn nhất tỉnh Bình Dương. Tiếng máy may rầm rì, mùi vải mới, 300 công nhân đang bắt đầu ca sáng. Nhưng ở góc xa, bạn để ý thấy những chiếc hộp gỗ lớn mang nhãn hiệu "FANUC Industrial Robot" còn chưa được mở...',
    npc: {
      name: "Bà Hoa",
      emoji: "👩‍💼",
      role: "Trưởng Phòng Nhân Sự",
      dialogue:
        "Chào mừng em đến Sáng Nam! Nhà máy chúng ta đang trong giai đoạn... chuyển đổi quan trọng. Em sẽ bắt đầu ở tổ may số 3. À, mấy hộp kia tuần sau sẽ lắp đặt. Hiện đại hóa thôi mà!",
    },
    choices: [
      {
        text: '🎓 "Theo nghiên cứu, tự động hóa ảnh hưởng 40% việc làm ngành dệt may. Công ty có kế hoạch đào tạo lại công nhân không?"',
        feedback:
          'Bà Hoa ngạc nhiên: "Em học kinh tế à? Ồ... công ty sẽ có chính sách phù hợp..." Rõ ràng bà không chuẩn bị cho câu hỏi chuyên môn này. Nhưng bạn ghi điểm với ban quản lý nhờ tư duy phân tích.',
        effect: { knowledge: 10, social: 10 },
        next: "baotu",
        conceptTag: "Phân Tích Dữ Liệu",
        requirement: { stat: "knowledge", min: 50 },
        roleBonus: "student",
      },
      {
        text: '👷 "Những robot đó sẽ ảnh hưởng đến việc làm của anh chị công nhân thế nào, bà?"',
        feedback:
          'Bà Hoa ngập ngừng: "Ồ... công ty sẽ có chính sách phù hợp..." Một công nhân đứng gần gật đầu với bạn – bạn đang hỏi điều mọi người muốn biết nhưng không dám hỏi.',
        effect: { social: 12, willpower: 5 },
        next: "baotu",
        conceptTag: "Tiếng Nói Công Nhân",
        roleBonus: "worker",
      },
      {
        text: '💻 "Những robot kia là dòng FANUC M-20iA đúng không? Em có thể xin tài liệu kỹ thuật để tìm hiểu không?"',
        feedback:
          'Bà Hoa bất ngờ: "Ồ em biết về robot à? Hay đấy, tuần sau em ghé phòng IT nhé." Kỹ năng công nghệ của bạn mở ra cơ hội tiếp cận sớm.',
        effect: { knowledge: 8, wealth: 8 },
        next: "baotu",
        conceptTag: "Kỹ Năng Công Nghệ",
        requirement: { stat: "wealth", min: 50 },
        roleBonus: "technician",
      },
      {
        text: "Cảm ơn bà! Tôi sẽ cố gắng học hỏi và làm tốt công việc của mình.",
        feedback:
          "Bà Hoa mỉm cười hài lòng. Bạn được dẫn đến tổ may số 3, nơi Bác Tư đang ngồi chờ với chiếc máy may cũ nhất tổ.",
        effect: { willpower: 5 },
        next: "baotu",
      },
    ],
  },

  baotu: {
    id: "baotu",
    title: "Triết Học Dưới Ánh Đèn Xưởng",
    bgAccent: "var(--secondary)",
    setting: "Tổ may số 3 · Góc cuối xưởng",
    narrative:
      "Bác Tư – 55 tuổi, 20 năm làm thợ may – ngồi bên chiếc máy cũ nhất tổ. Bàn tay ông thoăn thoắt, mỗi mũi chỉ chính xác như một bản nhạc đã thuộc lòng. Ông nhìn bạn và nói không ngừng tay...",
    npc: {
      name: "Bác Tư",
      emoji: "👴",
      role: "Thợ may · 20 năm kinh nghiệm",
      dialogue:
        "Cháu mới vào à? Ngồi đây Bác chỉ cho. Cháu thấy cái áo này không – 15 phút tôi may xong. Cái 15 phút đó... không phải 15 phút của riêng Bác Tư già này đâu. Đó là thời gian LAO ĐỘNG XÃ HỘI TRUNG BÌNH – thời gian cần thiết trong xã hội để may một chiếc áo. Cái đó tạo nên GIÁ TRỊ của nó.",
    },
    choices: [
      {
        text: '🎓 "Bác đang nói về Lao động Trừu tượng theo Mác – hao phí sức người nói chung tạo ra giá trị – khác with Lao động Cụ thể tạo ra chiếc áo này?"',
        feedback:
          'Mắt Bác Tư sáng lên: "Ồ! Cháu học Triết học rồi à? Chính xác 100%! Lao động CỤ THỂ tạo ra CHIẾC ÁO – giá trị sử dụng. Lao động TRỪU TƯỢNG – hao phí sức người nói chung – tạo ra GIÁ TRỊ trao đổi. Cháu nắm vững lý thuyết đấy!"',
        effect: { knowledge: 25, social: 8, gem: "Hai Mặt Lao Động" },
        next: "robots",
        conceptTag: "Lao Động Cụ Thể & Trừu Tượng",
        requirement: { stat: "knowledge", min: 40 },
        roleBonus: "student",
      },
      {
        text: '💻 "Bác ơi, nếu máy làm trong 5 phút thì thời gian xã hội cần thiết giảm → giá trị áo giảm → lương công nhân cũng chịu áp lực giảm đúng không?"',
        feedback:
          'Bác Tư gật đầu: "Cháu hiểu cả logic kinh tế! Đúng vậy – năng suất tăng → giá trị giảm → ông chủ muốn giảm lương. Đây là vòng luẩn quẩn của tư bản chủ nghĩa mà cháu đang thấy."',
        effect: { knowledge: 18, wealth: 8, gem: "Năng Suất & Giá Trị" },
        next: "robots",
        conceptTag: "Phân Tích Kinh Tế",
        requirement: { stat: "wealth", min: 45 },
        roleBonus: "technician",
      },
      {
        text: '👷 "Bác ơi... Bác thấy mấy cái robot kia chưa? 20 năm kinh nghiệm của bác... họ sẽ thay thế mất thôi."',
        feedback:
          'Bác Tư dừng tay, đặt tay lên vai bạn: "Cháu nói đúng nỗi lo của Bác. Nhưng Bác biết: robot là TƯ BẢN CHẾT – chỉ chuyển giá trị. Chúng ta là TƯ BẢN SỐNG – TẠO RA giá trị mới. Bọn cháu phải hiểu để đấu tranh cho quyền của mình!"',
        effect: {
          willpower: 20,
          social: 15,
          knowledge: 5,
          gem: "Lao Động Sống & Chết",
        },
        next: "robots",
        conceptTag: "Đoàn Kết Công Nhân",
        requirement: { stat: "willpower", min: 35 },
        roleBonus: "worker",
      },
      {
        text: "Nghe có vẻ phức tạp quá... Tôi chỉ cần làm tốt công việc được giao thôi.",
        feedback:
          'Bác Tư thở dài: "Ừ... cũng được. Nhưng cháu nhớ: không hiểu thì dễ bị lợi dụng lắm."',
        effect: { wealth: 5 },
        next: "robots",
      },
    ],
  },

  robots: {
    id: "robots",
    title: "Ngày Robot Đến",
    bgAccent: "var(--destructive)",
    setting: "Sân nhà máy · Thứ Hai đầu tháng Tư",
    narrative:
      "Buổi sáng thứ Hai đầu tháng Tư. Một đoàn 5 xe tải đỗ xịch trước cổng nhà máy. Công nhân đứng xem im lặng khi 20 cánh tay robot công nghiệp được cẩu xuống. Chị Mai – trưởng công đoàn 35 tuổi, giọng miền Trung rõ ràng – đứng giữa đám đông...",
    npc: {
      name: "Chị Mai",
      emoji: "👩‍🦱",
      role: "Trưởng Công Đoàn",
      dialogue:
        "Các bạn ơi! Đây là lúc chúng ta cần HIỂU rõ để HÀNH ĐỘNG đúng! Những robot kia là TƯ BẢN BẤT BIẾN: không tạo giá trị mới, chỉ chuyển dần giá trị bản thân vào sản phẩm qua khấu hao. Còn SỨC LAO ĐỘNG của chúng ta – đó là TƯ BẢN KHẢ BIẾN – thứ DUY NHẤT tạo ra giá trị mới và giá trị thặng dư cho ông chủ!",
    },
    choices: [
      {
        text: '🎓 "Đây chính là NGHỊCH LÝ TỰ ĐỘNG HÓA Mác dự báo! Tư bản cá nhân lợi nhưng toàn hệ thống mất nguồn giá trị thặng dư. Xu hướng tỷ suất lợi nhuận giảm dần (m\'/C) là tất yếu!"',
        feedback:
          'Chị Mai hào hứng vỗ vai bạn: "Chính xác! Cháu nắm vững lý thuyết! Đây là mâu thuẫn nội tại của CNTB – không ai lập kế hoạch chung, mỗi ông chủ chỉ lo lợi nhuận riêng → khủng hoảng tất yếu!" Bạn được mời làm cố vấn lý thuyết cho công đoàn.',
        effect: { knowledge: 30, social: 25, gem: "Nghịch Lý Tự Động Hóa" },
        next: "overtime",
        conceptTag: "Nghịch Lý Tự Động Hóa",
        requirement: { stat: "knowledge", min: 55 },
        roleBonus: "student",
      },
      {
        text: '💻 "Tôi muốn học vận hành robot này. Nếu hiểu công nghệ, mình có thể trở thành kỹ sư bảo trì – vị trí mới with lương cao hơn."',
        feedback:
          'Chị Mai gật đầu: "Thực đấy. Thích nghi thông minh – nhưng nhớ dùng kỹ năng để giúp anh em công nhân khác nhé." Bạn được ưu tiên đào tạo kỹ năng số, mở ra cơ hội thăng tiến.',
        effect: { wealth: 25, knowledge: 12, social: 5 },
        next: "overtime",
        conceptTag: "Nâng Cấp Kỹ Năng",
        requirement: { stat: "wealth", min: 50 },
        roleBonus: "technician",
      },
      {
        text: '👷 "Chị ơi! Chúng ta phải đoàn kết lại, yêu cầu công ty cam kết KHÔNG SA THẢI và có quỹ đào tạo lại! Đây là quyền chính đáng của người lao động!"',
        feedback:
          'Chị Mai nắm tay bạn: "Đúng! Tinh thần đấu tranh đây rồi! Nhưng cần chiến lược – không phải chống robot, mà đòi CHIA SẺ THÀNH QUẢ từ robot!" Bạn được bầu làm đại diện tổ trong cuộc đàm phán sắp tới.',
        effect: {
          willpower: 30,
          social: 20,
          knowledge: 5,
          gem: "Đoàn Kết Công Nhân",
        },
        next: "overtime",
        conceptTag: "Hành Động Tập Thể",
        requirement: { stat: "willpower", min: 50 },
        roleBonus: "worker",
      },
      {
        text: "Tình hình khó quá... Có lẽ nên tìm việc khác an toàn hơn.",
        feedback:
          'Chị Mai thở dài: "Chạy được đâu cháu... AI đang lan khắp mọi ngành. Ở đây ít nhất còn có tập thể để dựa vào."',
        effect: { willpower: -5, social: 5 },
        next: "overtime",
      },
    ],
  },

  overtime: {
    id: "overtime",
    title: "Cơn Lốc Cường Độ",
    bgAccent: "var(--destructive)",
    setting: "Xưởng may Sáng Nam · 8 giờ tối",
    narrative:
      'Đã 8 giờ tối, nhưng xưởng vẫn sáng trưng đèn. Hệ thống AI mới cài đặt không chỉ điều khiển robot mà còn theo dõi từng thao tác của con người qua camera cảm biến. "Nhanh lên 10% nữa!" – tiếng loa vang lên. Bác Tư mồ hôi nhễ nhại, đôi tay đã bắt đầu run vì mệt mỏi...',
    npc: {
      name: "Giám sát viên",
      emoji: "🧐",
      role: "Quản lý xưởng",
      dialogue:
        "Các anh chị cố lên! Robot không biết mệt, chúng ta cũng phải đuổi kịp chúng. Đây là cách duy nhất để đơn hàng không bị hủy!",
    },
    choices: [
      {
        text: '🎓 "Bác Tư ơi, đây là bóc lột GIÁ TRỊ THẶNG DƯ TUYỆT ĐỐI bằng cách tăng cường độ và kéo dài giờ làm. Chúng ta cần yêu cầu tăng lương tương xứng with hao phí sức lao động!"',
        feedback:
          'Bạn giải thích lý luận giúp mọi người nhận ra mình đang bị vắt kiệt. Bác Tư gật đầu: "Đúng, mồ hôi chúng ta tạo ra tiền cho họ, không thể để họ coi mình như máy móc!"',
        effect: { knowledge: 20, willpower: 15, gem: "Thặng Dư Tuyệt Đối" },
        next: "reserve_army",
        conceptTag: "Giá Trị Thặng Dư Tuyệt Đối",
        roleBonus: "student",
      },
      {
        text: '👷 "Dừng máy lại! Chúng ta cần nghỉ ngơi. Cường độ thế này là vi phạm luật lao động và bản chất nhân văn mà Mác đã bảo vệ!"',
        feedback:
          "Bạn dẫn đầu nhóm công nhân kiến nghị nghỉ giải lao. Sự đoàn kết khiến giám sát viên phải nhượng bộ. Uy tín của bạn tăng cao.",
        effect: { social: 20, willpower: 20, gem: "Đấu Tranh Giai Cấp" },
        next: "reserve_army",
        conceptTag: "Đấu Tranh Tập Thể",
        requirement: { stat: "willpower", min: 45 },
        roleBonus: "worker",
      },
      {
        text: '💻 "Tôi sẽ điều chỉnh lại thuật toán AI để tối ưu hóa quy trình thay vì ép người làm nhanh hơn. AI phải phục vụ con người, không phải nô dịch!"',
        feedback:
          "Kỹ năng của bạn giúp giảm tải cho anh em mà vẫn đảm bảo sản lượng. Giám đốc Toàn rất ấn tượng with giải pháp thông minh này.",
        effect: { knowledge: 15, wealth: 20, gem: "AI Nhân Văn" },
        next: "reserve_army",
        conceptTag: "Công Nghệ Vì Con Người",
        requirement: { stat: "wealth", min: 40 },
        roleBonus: "technician",
      },
    ],
  },

  reserve_army: {
    id: "reserve_army",
    title: "Đội Quân Dự Bị",
    bgAccent: "var(--muted)",
    setting: "Cổng nhà máy · Chiều mưa",
    narrative:
      "Dưới cơn mưa phùn, một thông báo mới được dán lên: 30 công nhân tổ may cũ sẽ phải tạm nghỉ việc do dây chuyền robot đã vận hành ổn định. Những khuôn mặt thẫn thờ, những túi đồ cá nhân vội vã. Bạn thấy Anh Hùng – một thợ giỏi – đang đứng nhìn xa xăm...",
    npc: {
      name: "Anh Hùng",
      emoji: "🧑‍🔧",
      role: "Công nhân bị sa thải",
      dialogue:
        "Tôi làm ở đây 10 năm rồi... Bây giờ robot thay thế, tôi biết đi đâu? Có phải chúng ta đã trở thành những món đồ thừa thãi?",
    },
    choices: [
      {
        text: '🎓 "Anh không phải đồ thừa! Theo Mác, đây là ĐỘI QUÂN DỰ BỊ CÔNG NGHIỆP tất yếu của tích lũy tư bản. Hệ thống tạo ra người thất nghiệp để giữ lương ở mức thấp!"',
        feedback:
          'Anh Hùng bắt tay bạn: "Cảm ơn em đã giải thích. Hóa ra không phải lỗi của tôi, mà là quy luật của hệ thống này."',
        effect: { knowledge: 25, social: 10, gem: "Đội Quân Dự Bị" },
        next: "crossroads",
        conceptTag: "Đội Quân Dự Bị Công Nghiệp",
        roleBonus: "student",
      },
      {
        text: '👷 "Chúng ta không thể để anh em ra đi tay trắng! Hợp tác xã số là giải pháp – chúng ta sẽ tự làm chủ những con robot này!"',
        feedback:
          "Ý tưởng của bạn thắp lên hy vọng. Một nhóm công nhân bắt đầu thảo luận về việc thành lập mô hình kinh tế mới.",
        effect: { willpower: 25, social: 25, gem: "Hợp Tác Xã Số" },
        next: "crossroads",
        conceptTag: "Hợp Tác Xã Số",
        requirement: { stat: "social", min: 40 },
        roleBonus: "worker",
      },
      {
        text: '💻 "Tôi đã soạn sẵn một lộ trình học nghề mới về bảo trì robot cho các anh. Tôi sẽ dùng tiền lương của mình để hỗ trợ tài liệu ban đầu."',
        feedback:
          "Sự hào hiệp và kỹ năng của bạn giúp anh em có hướng đi mới. Bạn đang biến lao động giản đơn thành lao động phức tạp.",
        effect: { wealth: -10, social: 30, knowledge: 15 },
        next: "crossroads",
        conceptTag: "Đào Tạo Lại",
        roleBonus: "technician",
      },
    ],
  },

  crossroads: {
    id: "crossroads",
    title: "Ngã Rẽ Lịch Sử",
    bgAccent: "var(--secondary)",
    setting: "Quán cà phê vỉa hè · Chiều tối",
    narrative:
      "Sau cuộc tranh luận, bạn ngồi một mình với ly cà phê đen nguội dần. Ngoài cửa sổ, những công nhân tan ca đi qua – mỗi người một nét mặt khác nhau. Điện thoại reo. GS. Hùng – người thầy Triết học chính trị từ thời đại học – gọi đúng lúc này...",
    npc: {
      name: "GS. Hùng",
      emoji: "👨‍🏫",
      role: "Giáo sư Kinh tế Chính trị",
      dialogue:
        "Thầy nghe nói em đang ở Sáng Nam. Đây là ngã rẽ lịch sử không chỉ của em mà của cả thế hệ. Thầy thấy em có ba con đường. Mỗi con đường đều đúng theo cách riêng – câu hỏi là em muốn đóng góp gì cho quá trình biến đổi lịch sử này?",
    },
    choices: [
      {
        text: "🤝 Trở thành tiếng nói của người lao động – tổ chức phong trào, đấu tranh cho quyền lợi trong kỷ nguyên AI",
        feedback:
          'GS. Hùng: "Con đường gian khó nhưng có ý nghĩa lịch sử nhất. Mác dạy: thay đổi quan hệ sản xuất không thể không có đấu tranh có tổ chức."',
        effect: { willpower: 10, social: 10 },
        next: "path_a1",
      },
      {
        text: "💻 Nâng cấp bản thân thành lao động phức tạp – học AI, kỹ năng số, trở thành không thể thay thế",
        feedback:
          'GS. Hùng: "Con đường thực tế và cá nhân. Nhớ rằng lao động phức tạp tạo nhiều giá trị hơn – nhưng đừng quên trách nhiệm với cộng đồng."',
        effect: { knowledge: 10, wealth: 10 },
        next: "path_b1",
      },
      {
        text: "🌱 Kiến tạo mô hình hợp tác xã số – công nhân đồng sở hữu AI và robot, chia sẻ thành quả",
        feedback:
          'GS. Hùng hào hứng: "Con đường sáng tạo nhất! Giải quyết mâu thuẫn cơ bản mà Mác chỉ ra – công nhân kiểm soát tư liệu sản xuất!"',
        effect: { knowledge: 5, social: 15, willpower: 5 },
        next: "path_c1",
      },
    ],
  },

  path_a1: {
    id: "path_a1",
    title: "Con Đường Đấu Tranh",
    bgAccent: "var(--primary)",
    setting: "Liên đoàn Lao Động Số Việt Nam · 2026",
    narrative:
      "Bạn gia nhập Liên đoàn Lao Động Số Việt Nam – tổ chức mới thành lập năm 2026 với 10,000 thành viên. Hàng ngày: gặp gỡ công nhân, giải thích quyền lợi, soạn thảo kiến nghị, huấn luyện kỹ năng đàm phán. Một buổi tối, bạn và Chị Mai ngồi soạn điều khoản quan trọng nhất...",
    npc: {
      name: "Chị Mai",
      emoji: "👩‍🦱",
      role: "Đồng Nghiệp · Liên đoàn LĐ Số",
      dialogue:
        'Điều khoản quan trọng nhất: "Doanh nghiệp tự động hóa trên 30% phải đóng 15% lợi nhuận tăng thêm vào Quỹ Chuyển Đổi Lao Động." Bạn nghĩ sao?',
    },
    choices: [
      {
        text: "Đồng ý và thêm: công nhân bị thay thế có quyền ưu tiên đào tạo lại miễn phí 24 tháng, được hỗ trợ sinh hoạt phí trong thời gian chuyển đổi.",
        feedback:
          'Chị Mai: "Hoàn hảo! Đây chính là áp dụng nguyên tắc Mác vào thực tiễn – phân phối lại thành quả tự động hóa cho người lao động bị thay thế."',
        effect: {
          knowledge: 10,
          social: 20,
          willpower: 10,
          gem: "Chính Sách Lao Động Số",
        },
        next: "path_a2",
      },
      {
        text: "Tập trung vào điều khoản cấm sa thải hàng loạt không có kế hoạch chuyển đổi trước ít nhất 6 tháng.",
        feedback:
          'Chị Mai gật đầu: "Bảo vệ trước mắt đúng hướng! Kết hợp cả hai điều khoản sẽ toàn diện hơn."',
        effect: { willpower: 15, social: 15 },
        next: "path_a2",
      },
    ],
  },

  path_a2: {
    id: "path_a2",
    title: "Tiếng Nói Lịch Sử",
    bgAccent: "var(--primary)",
    setting: "Hội trường Quốc hội · Hà Nội · 2030",
    narrative:
      "Năm 2030. Bạn đứng trước microphone tại Hội trường Diên Hồng, đọc tham luận cuối cùng trước khi Quốc hội bỏ phiếu thông qua Luật Lao Động Số. Phía sau bạn: 50 đại diện công nhân từ 30 tỉnh thành. Bên ngoài, 5,000 người đang chờ kết quả...",
    npc: {
      name: "Chủ tọa",
      emoji: "🏛️",
      role: "Đại biểu Quốc hội",
      dialogue: "Đại biểu có 3 phút để kết luận trước khi Quốc hội biểu quyết.",
    },
    choices: [
      {
        text: "Nhấn mạnh: AI và robot là tư liệu sản xuất mới – ai kiểm soát chúng, người đó quyết định tương lai lao động Việt Nam. Phải đảm bảo người lao động có tiếng nói!",
        feedback:
          "Tiếng vỗ tay vang lên. Luật được thông qua với 78% phiếu thuận. Lịch sử ghi nhận tên bạn.",
        effect: {
          social: 30,
          knowledge: 10,
          willpower: 10,
          gem: "Kiến Tạo Lịch Sử",
        },
        next: "ending_a",
      },
      {
        text: "Nhấn mạnh: Không ai bị bỏ lại phía sau – đây là nguyên tắc cốt lõi của CNH–HĐH định hướng XHCN Việt Nam.",
        feedback:
          "Cả hội trường im lặng rồi bùng vỡ tiếng vỗ tay. Luật được thông qua. Ngày lịch sử.",
        effect: { social: 25, willpower: 20, gem: "Kiến Tạo Lịch Sử" },
        next: "ending_a",
      },
    ],
  },

  path_b1: {
    id: "path_b1",
    title: "Học Lại Từ Đầu",
    bgAccent: "var(--accent)",
    setting: "Trường FPT · Hà Nội · 2026",
    narrative:
      'Bạn đăng ký chương trình "AI Engineer Fast Track" – 18 tháng học từ sáng đến tối. Ban ngày code Python, ban đêm đọc về machine learning. Tiền tiết kiệm dần cạn. Nhưng mỗi tuần bạn cảm thấy rõ: bộ não mình đang trở thành thứ khó bị thay thế nhất trên thị trường...',
    npc: {
      name: "Thầy Khoa",
      emoji: "👨‍💻",
      role: "Giảng viên AI",
      dialogue:
        "Em biết tại sao AI engineer khó bị thay thế không? Vì đây là LAO ĐỘNG PHỨC TẠP – 1 giờ lao động phức tạp = nhiều giờ lao động giản đơn theo Mác. Thú vị là: chúng ta đang tạo ra thứ sẽ thay thế lao động khác – mâu thuẫn biện chứng thú vị!",
    },
    choices: [
      {
        text: "Chuyên về AI xã hội: hệ thống hỗ trợ công nhân chuyển đổi nghề, matching kỹ năng với việc làm mới.",
        feedback:
          'Thầy Khoa: "Tuyệt vời! Dùng AI để giải quyết vấn đề AI gây ra – đây là tư duy biện chứng thực sự!"',
        effect: {
          knowledge: 20,
          social: 15,
          wealth: 10,
          gem: "Lao Động Phức Tạp",
        },
        next: "path_b2",
        conceptTag: "Lao Động Phức Tạp",
      },
      {
        text: "Chuyên về AI tối ưu hóa sản xuất – nhu cầu thực tế nhất của thị trường doanh nghiệp.",
        feedback:
          'Thầy Khoa: "Thực tế và thu nhập cao. Nhưng hãy cân nhắc tác động xã hội dài hạn của công việc mình làm."',
        effect: { wealth: 25, knowledge: 15 },
        next: "path_b2",
      },
    ],
  },

  path_b2: {
    id: "path_b2",
    title: "Bước Nhảy Vọt",
    bgAccent: "var(--accent)",
    setting: "VinAI Research · Hà Nội · 2030",
    narrative:
      'Năm 2030. Bạn là AI Engineer tại VinAI Research. Dự án của bạn: "VietTransition AI" – hệ thống phân tích kỹ năng công nhân và gợi ý con đường chuyển đổi nghề phù hợp nhất. Đã giúp 300,000 công nhân tìm việc mới trong 18 tháng...',
    npc: {
      name: "GĐ VinAI",
      emoji: "🔬",
      role: "Giám đốc Nghiên cứu",
      dialogue:
        "Dự án của bạn vừa được Bộ LĐTBXH chọn triển khai toàn quốc. Lần đầu tiên một sản phẩm AI Made in Vietnam giải quyết vấn đề lao động theo cách riêng của Việt Nam.",
    },
    choices: [
      {
        text: "Mở mã nguồn VietTransition – để cả xã hội cùng phát triển, không độc quyền.",
        feedback:
          "Quyết định táo bạo. Hàng trăm kỹ sư cùng cải thiện. Ảnh hưởng lan rộng hơn nhiều.",
        effect: {
          social: 25,
          knowledge: 10,
          wealth: -10,
          gem: "AI Vì Cộng Đồng",
        },
        next: "ending_b",
      },
      {
        text: "Thương mại hóa VietTransition để tự chủ tài chính và mở rộng quy mô nhanh hơn.",
        feedback:
          "Bền vững về tài chính, mở rộng nhanh hơn. Thu nhập tốt, ảnh hưởng rộng theo cách khác.",
        effect: { wealth: 20, knowledge: 10, social: 10 },
        next: "ending_b",
      },
    ],
  },

  path_c1: {
    id: "path_c1",
    title: "Xây Dựng Mô Hình Mới",
    bgAccent: "var(--secondary)",
    setting: "Nhà kho cũ · Bình Dương · 2026",
    narrative:
      'Bạn tập hợp 25 cựu công nhân Sáng Nam. Mỗi người góp 5 triệu đồng. Cộng với khoản vay Quỹ Phát Triển HTX, bạn mua được 3 robot hàn và thuê không gian sản xuất. Hợp tác xã số đầu tiên ở Bình Dương ra đời. Tên: "SángTạo Coop"...',
    npc: {
      name: "Anh Bình",
      emoji: "🤝",
      role: "Thành Viên Hợp Tác Xã",
      dialogue:
        "Lần đầu tiên tôi cảm thấy robot là của MÌNH chứ không phải đang thay thế mình. Chúng ta SỞ HỮU tư liệu sản xuất – điều Mác coi là chìa khóa giải phóng người lao động!",
    },
    choices: [
      {
        text: "Áp dụng dân chủ công nghiệp: mỗi thành viên một phiếu, lợi nhuận chia theo đóng góp lao động.",
        feedback:
          "Thành viên hoan nghênh nhiệt liệt. Năng suất tăng 40% trong 6 tháng – khi người lao động là chủ!",
        effect: {
          social: 20,
          knowledge: 15,
          willpower: 10,
          gem: "Dân Chủ Công Nghiệp",
        },
        next: "path_c2",
        conceptTag: "Công Nhân Kiểm Soát Tư Liệu SX",
      },
      {
        text: "Ưu tiên tái đầu tư lợi nhuận vào robot mới và đào tạo – phát triển quy mô nhanh hơn.",
        feedback:
          "Chiến lược tăng trưởng tốt. HTX mở rộng gấp đôi sau 1 năm. Ảnh hưởng lan rộng.",
        effect: { wealth: 15, social: 15, knowledge: 10 },
        next: "path_c2",
      },
    ],
  },

  path_c2: {
    id: "path_c2",
    title: "Nhân Rộng Mô Hình",
    bgAccent: "var(--secondary)",
    setting: "Hội nghị HTX Số · TP.HCM · 2030",
    narrative:
      "Năm 2030. SángTạo Coop đã nhân rộng ra 45 đơn vị ở 8 tỉnh thành, với 4,500 công nhân–chủ sở hữu. Hội nghị hôm nay bàn về Liên Minh HTX Số Việt Nam...",
    npc: {
      name: "Đại Diện ADB",
      emoji: "🌏",
      role: "Ngân hàng Phát triển Châu Á",
      dialogue:
        "Chúng tôi muốn đầu tư 50 triệu USD vào mô hình HTX số Việt Nam. Đây là giải pháp độc đáo chưa thấy ở bất kỳ quốc gia nào.",
    },
    choices: [
      {
        text: "Chấp nhận đầu tư với điều kiện bất khả xâm phạm: nguyên tắc dân chủ công nhân không bị thay đổi.",
        feedback:
          "Quyết định khó nhưng đúng. ADB đồng ý. Mô hình mở rộng nhanh mà vẫn giữ bản chất.",
        effect: {
          social: 25,
          wealth: 15,
          knowledge: 10,
          gem: "Kinh Tế HTX Số",
        },
        next: "ending_c",
      },
      {
        text: "Từ chối – mở rộng từ từ bằng nội lực để giữ tính độc lập hoàn toàn.",
        feedback:
          "Tăng trưởng chậm hơn nhưng hoàn toàn độc lập. Mô hình thuần Việt Nam.",
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
  const maxStat = Math.max(
    stats.knowledge,
    stats.willpower,
    stats.wealth,
    stats.social,
  );
  if (maxStat === stats.knowledge) return "ending_b";
  if (maxStat === stats.willpower || maxStat === stats.social)
    return "ending_a";
  return "ending_c";
};

// ═══════════════════ SUB-COMPONENTS ═══════════════════

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
    };
    setCharacter(newChar);
    setPhase("intro_slides");
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
    setCharacter({
      ...character,
      stats: newStats,
      gems: newGems,
      history: newHistory,
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
      setPhase("ending");
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
    setPhase("ending");
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
          ) : phase === "battle" ? (
            <BattleScreen
              battle={battle}
              character={character!}
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
          ) : phase === "ai_usage" && character ? (
            <AIUsageScreen
              character={character}
              onStart={() => setPhase("scene")}
            />
          ) : (
            <SceneScreen
              scene={scene}
              phase={phase}
              feedbackMsg={feedbackMsg}
              showDelta={showDelta}
              statDelta={statDelta}
              onChoice={handleChoice}
              onAdvance={advanceFromFeedback}
              character={character!}
            />
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
  return (
    <div key={scene.id} className="scale-in">
      {/* Setting banner */}
      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          padding: "10px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            background: "var(--primary)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "var(--primary)",
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
          marginBottom: 16,
          fontSize: "clamp(18px, 3vw, 26px)",
          textTransform: "uppercase",
          borderBottom: "2px solid var(--primary)",
          display: "inline-block",
          paddingBottom: 4,
        }}
      >
        {scene.title}
      </h2>

      {/* Narrative */}
      <div
        className="industrial-card"
        style={{ padding: 22, marginBottom: 18 }}
      >
        <p
          style={{
            color: "var(--foreground)",
            lineHeight: 1.8,
            fontSize: 15,
            margin: 0,
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
            background: "var(--muted)",
            border: "1px solid var(--border)",
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 40 }}>{scene.npc.emoji}</div>
              <div
                style={{
                  color: "var(--primary)",
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: "900",
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
            <div style={{ flex: 1, padding: 14 }}>
              <p
                style={{
                  color: "var(--foreground)",
                  lineHeight: 1.7,
                  fontSize: 14,
                  margin: 0,
                  fontStyle: "italic",
                  borderLeft: "3px solid var(--primary)",
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
              border: "1px solid var(--primary)",
              background: "var(--muted)",
              padding: 18,
              marginBottom: 18,
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
                      border: "1px solid var(--primary)",
                      padding: "4px 14px",
                      color: "var(--primary)",
                      fontSize: 11,
                      fontWeight: "900",
                      textTransform: "uppercase",
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
              opacity: 0.5,
              fontSize: 11,
              marginBottom: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            ▶ CHỌN HÀNH ĐỘNG:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    padding: 18,
                    border: isLocked
                      ? "1px solid var(--border)"
                      : `1px solid var(--primary)`,
                    background: isLocked ? "var(--muted)" : "transparent",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.5 : 1,
                    transition: "all 0.3s",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        border: isLocked
                          ? "1px solid var(--border)"
                          : `1px solid var(--primary)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "var(--primary)",
                        fontSize: 13,
                        fontWeight: "900",
                      }}
                    >
                      {isLocked ? "🔒" : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          color: "var(--foreground)",
                          fontSize: 14,
                          lineHeight: 1.6,
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
                              border: "1px solid var(--primary)",
                              padding: "2px 10px",
                              color: "var(--primary)",
                              fontSize: 10,
                              fontWeight: "900",
                              textTransform: "uppercase",
                            }}
                          >
                            {choice.conceptTag}
                          </span>
                        )}
                        {hasBonus && !isLocked && (
                          <span
                            style={{
                              background: "var(--primary)",
                              padding: "2px 10px",
                              color: "var(--background)",
                              fontSize: 10,
                              fontWeight: "900",
                              textTransform: "uppercase",
                            }}
                          >
                            THẾ MẠNH{" "}
                            {CLASS_CONFIGS[character.characterClass].label}
                          </span>
                        )}
                        {isLocked && choice.requirement && (
                          <span
                            style={{
                              border: "1px solid var(--primary)",
                              padding: "2px 10px",
                              color: "var(--primary)",
                              fontSize: 10,
                              fontWeight: "900",
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
  return (
    <div
      className="industrial-container"
      style={{
        maxWidth: 850,
        margin: "60px auto",
        animation: "fadeIn 0.8s ease-out",
      }}
    >
      <div
        className="glass-industrial"
        style={{
          padding: "60px",
          border: "1px solid var(--primary)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 50px rgba(165, 28, 48, 0.1)",
        }}
      >
        {/* Decorative corner */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 100,
            height: 100,
            background:
              "linear-gradient(135deg, transparent 50%, var(--primary) 50%)",
            opacity: 0.1,
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: 80,
              marginBottom: 20,
              filter: "drop-shadow(0 0 15px rgba(165, 28, 48, 0.3))",
            }}
          >
            {ending.emoji}
          </div>
          <div
            style={{
              color: "var(--primary)",
              fontWeight: "900",
              fontSize: 12,
              letterSpacing: 5,
              marginBottom: 10,
            }}
          >
            KẾT THÚC CHƯƠNG TRÌNH
          </div>
          <h2
            style={{
              fontSize: 42,
              color: "#fff",
              fontFamily: "var(--font-slab)",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {ending.title}
          </h2>
          <div
            style={{
              height: 4,
              width: 60,
              background: "var(--primary)",
              margin: "20px auto 0",
            }}
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            padding: 30,
            borderRadius: "4px",
            borderLeft: "4px solid var(--primary)",
            marginBottom: 30,
          }}
        >
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            "{ending.narrative}"
          </p>
        </div>

        <div
          className="industrial-card"
          style={{
            padding: 30,
            background: "rgba(165, 28, 48, 0.05)",
            border: "1px solid rgba(165, 28, 48, 0.2)",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 15,
            }}
          >
            <span style={{ fontSize: 20 }}>📚</span>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "900",
                fontSize: 11,
                letterSpacing: 2,
              }}
            >
              BÀI HỌC LÝ LUẬN MÁC-XÍT
            </span>
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            {ending.marxLesson}
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <button
            onClick={onRestart}
            className="btn-primary"
            style={{
              padding: 20,
              fontSize: 15,
              fontWeight: "900",
              background: "transparent",
              border: "1px solid var(--primary)",
              color: "var(--primary)",
            }}
          >
            THỬ THÁCH LẠI ↺
          </button>
          <button
            onClick={onHome}
            className="btn-primary"
            style={{ padding: 20, fontSize: 15, fontWeight: "900" }}
          >
            QUAY VỀ TRANG CHỦ ➔
          </button>
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
      desc: "AI hỗ trợ soạn nháp lời dẫn, câu mô tả và các diễn giải ban đầu. Nhóm chỉnh sửa lại để đúng tinh thần học phần, gọn hơn và ít khoa trương hơn.",
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
      title: "Dùng AI để sinh gợi ý ban đầu",
      text: "Nhóm dùng AI cho phần brainstorming, dàn ý, diễn đạt ban đầu hoặc hỗ trợ kỹ thuật. Mọi đầu ra nhận được đều được xem là bản nháp, không dùng nguyên trạng.",
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
  if (!character) return null;

  return (
    <motion.div
      className="industrial-container"
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className="industrial-card"
        style={{
          maxWidth: 900,
          width: "100%",
          padding: "60px 52px",
          background:
            "linear-gradient(135deg, var(--card) 0%, rgba(255,255,255,0.95) 100%)",
          boxShadow: "8px 8px 0 var(--border), 0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <motion.div
          style={{ marginBottom: 40 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            style={{
              display: "inline-block",
              background: "var(--primary)",
              color: "white",
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: "900",
              marginBottom: 20,
              borderRadius: 2,
            }}
          >
            APPENDIX · AI USAGE
          </div>
          <h2
            style={{
              fontSize: 42,
              fontFamily: "var(--font-slab)",
              margin: 0,
              marginBottom: 12,
              color: "var(--primary)",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            AI & Automation trong DTG
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "var(--primary)",
              opacity: 0.7,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Dialectical AI RPG - Trò chơi nhập vai duy tân học Mác và Chuyển đổi
            Số
          </p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          style={{
            background:
              "linear-gradient(135deg, rgba(165, 28, 48, 0.06) 0%, rgba(213,200,178,0.3) 100%)",
            padding: "28px",
            borderRadius: 12,
            borderLeft: "4px solid var(--primary)",
            backdropFilter: "blur(10px)",
            marginBottom: 32,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "var(--primary)",
              marginTop: 0,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>🤖</span> Robot & Tự động hóa
          </h3>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "var(--foreground)",
              opacity: 0.85,
            }}
          >
            Robot là <strong>Tư bản Bất Biến</strong> – chỉ chuyển dần giá trị
            của chính nó vào sản phẩm qua khấu hao. Vai trò thực sự của nó là
            <strong> tăng năng suất lao động xã hội</strong>, giúp rút ngắn thời
            gian tất yếu và kéo dài thời gian thặng dư.
          </p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginBottom: 32,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Column 1: Tech Stack */}
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "var(--primary)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              🤖 Robot & Tự động hóa
            </h3>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--foreground)",
                opacity: 0.85,
                margin: "0 0 12px 0",
              }}
            >
              Robot là <strong>Tư bản Bất Biến</strong> – chỉ chuyển dần giá trị
              của chính nó vào sản phẩm. Vai trò:{" "}
              <strong>tăng năng suất</strong>, rút ngắn thời gian tất yếu, kéo
              dài thặng dư.
            </p>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--foreground)",
                opacity: 0.8,
                margin: 0,
              }}
            >
              <strong>Ví dụ:</strong> Máy may có thể sản xuất một chiếc áo sơ mi
              trong 5 phút (thay vì 15 phút thủ công). Nhưng ngay cả với AI tốt
              nhất, máy vẫn chỉ chuyển "giá trị cũ" của chính nó vào áo, không
              tạo giá trị mới. Chỉ con người mới tạo giá trị mới!
            </p>
          </div>

          {/* Column 2: Game Features */}
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "var(--primary)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              🧠 Lao động Sống & Tri tuệ
            </h3>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--foreground)",
                opacity: 0.85,
                margin: "0 0 12px 0",
              }}
            >
              Chỉ <strong>Lao động Sống</strong> của con người mới tạo ra
              <strong> Giá trị Mới</strong>. Những tầm lớp mà AI phụ thuộc vào:
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--foreground)",
                opacity: 0.85,
              }}
            >
              <li>
                <strong>Thiết kế hệ thống:</strong> Kỹ sư quyết định cấu trúc
              </li>
              <li>
                <strong>Ra quyết định chiến lược:</strong> Quản trị viên điều
                hành
              </li>
              <li>
                <strong>Sáng tạo sản phẩm:</strong> Nhà thiết kế phát minh mới
              </li>
              <li>
                <strong>Kiểm soát & điều chỉnh:</strong> Con người giám sát AI
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Learning Content */}
        <motion.div
          style={{
            background: "rgba(165,28,48,0.08)",
            padding: "24px",
            borderRadius: 12,
            borderLeft: "4px solid var(--primary)",
            marginBottom: 32,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "var(--primary)",
              marginTop: 0,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📖</span> Nội Dung Học Tập
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: 4,
                }}
              >
                1️⃣ Bản Chất Lao Động
              </div>
              <span style={{ opacity: 0.8 }}>
                Lao động cụ thể vs trừu tượng trong kỷ nguyên số 4.0
              </span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: 4,
                }}
              >
                2️⃣ AI & Giá Trị
              </div>
              <span style={{ opacity: 0.8 }}>
                Robot là tư bản bất biến, con người tạo giá trị
              </span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: 4,
                }}
              >
                3️⃣ Phát Triển Nhân Lực
              </div>
              <span style={{ opacity: 0.8 }}>
                Chiến lược DTG của Việt Nam 2025-2030
              </span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: 4,
                }}
              >
                4️⃣ Hệ Sinh Thái
              </div>
              <span style={{ opacity: 0.8 }}>
                Giáo dục, doanh nghiệp, công nghệ bền vững
              </span>
            </div>
          </div>
        </motion.div>

        {/* Project Goal */}
        <motion.div
          style={{
            background: "rgba(165,28,48,0.08)",
            padding: "24px",
            borderRadius: 12,
            borderLeft: "4px solid var(--primary)",
            marginBottom: 32,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "var(--primary)",
              marginTop: 0,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🎯</span> Mục Tiêu Dự Án
          </h3>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.8,
              margin: 0,
              color: "var(--foreground)",
              opacity: 0.9,
            }}
          >
            Biến lý thuyết kinh tế chính trị Mác từ "khô hanh, trừu tượng" thành
            "tương tác, sinh động, thú vị". Sinh viên không chỉ học về lao động,
            giá trị và bóc lột - mà
            <strong> sống</strong> qua những tình huống thực tế, tranh luận với
            các nhân vật, và hiểu rõ tại sao "lý thuyết Mác vẫn relevant" cho
            Việt Nam năm 2025.
          </p>
        </motion.div>

        {/* Strategy Section */}
        <motion.div
          style={{
            background:
              "linear-gradient(135deg, rgba(165, 28, 48, 0.06) 0%, rgba(213,200,178,0.3) 100%)",
            padding: "28px",
            borderRadius: 12,
            borderLeft: "4px solid var(--primary)",
            backdropFilter: "blur(10px)",
            marginBottom: 32,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "var(--primary)",
              marginTop: 0,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📊</span> Kế hoạch DTG của VN: Từ
            "Gia công" → "Sáng tạo"
          </h3>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.8,
              margin: 0,
              color: "var(--foreground)",
              opacity: 0.9,
            }}
          >
            Việt Nam không thể chỉ hoạt động ở mức "gia công máy móc". Chiến
            lược là{" "}
            <strong>phát triển lực lượng lao động có tư duy chiến lược</strong>{" "}
            – những kỹ sư, quản trị viên hiểu rõ AI, có khả năng sáng tạo và
            điều hành hệ thống. Đây là cách để nâng cao giá trị gia tăng và giữ
            lại phần lớn giá trị thặng dư trong nước thay vì cho nước ngoài bóc
            lột.
          </p>
        </motion.div>

        {/* Character info */}
        <motion.div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: "1px solid var(--border)",
            marginBottom: 28,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "var(--primary)",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Nhân Vật Hiện Tại:
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {character.name} · {character.classLabel}{" "}
              <span style={{ opacity: 0.5 }}>({character.emoji})</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--foreground)",
              opacity: 0.5,
              textAlign: "right",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Tiến Trình:</div>
            <div
              style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}
            >
              ✓ Sẵn sàng
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          onClick={onStart}
          className="btn-primary"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "18px 32px",
            background: "var(--primary)",
            boxShadow:
              "0 4px 20px rgba(165, 28, 48, 0.3), 4px 4px 0 var(--secondary)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{
            y: -3,
            boxShadow:
              "0 8px 30px rgba(165, 28, 48, 0.4), 6px 6px 0 var(--secondary)",
          }}
          whileTap={{ scale: 0.98, y: 0 }}
        >
          Bắt đầu trải nghiệm trò chơi
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.div>
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
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  return (
    <div
      className="industrial-container"
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 0",
      }}
    >
      <motion.div
        key={currentIndex}
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
          LEARNING_MODULE // 0{currentIndex + 1} OF 0{slides.length}
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
            CONTENT LEARNING
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
            {slide.title}
          </h2>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            padding: "32px",
            borderRadius: 12,
            borderLeft: "4px solid var(--primary)",
            marginBottom: 32,
            flex: 1,
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "var(--foreground)",
              opacity: 0.9,
              marginBottom: 24,
              margin: 0,
            }}
          >
            {slide.content}
          </p>

          {/* Key Points */}
          {slide.keyPoints.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: "var(--primary)",
                  marginBottom: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Luận điểm chính:
              </div>
              {slide.keyPoints.map((point, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: i === slide.keyPoints.length - 1 ? 0 : 10,
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "var(--primary)", fontWeight: "900" }}>
                    ›
                  </span>
                  <span style={{ opacity: 0.85 }}>{point}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="btn-primary"
              style={{
                flex: 0.3,
                background: "transparent",
                border: "1px solid var(--primary)",
                color: "var(--primary)",
              }}
            >
              QUAY LẠI
            </button>
          )}
          <button
            onClick={
              isLast ? onFinish : () => setCurrentIndex(currentIndex + 1)
            }
            className="btn-primary"
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: 2,
            }}
          >
            {isLast ? "TIẾP TỤC TỚI PHỤ LỤC ➔" : "TIẾP TỤC ➔"}
          </button>
        </div>
      </motion.div>
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
      title: "Sức mạnh Tri thức",
      desc: "Mọi quyết định đều dựa trên sự hiểu biết về Kinh tế chính trị. Sai lầm sẽ dẫn đến sự phá sản của lý luận.",
    },
    {
      title: "Đấu tranh giai cấp",
      desc: "Trò chơi là sự mô phỏng cuộc đấu tranh giữa lao động sống và tư bản số.",
    },
    {
      title: "Lao động là nguồn gốc",
      desc: "Chỉ có lao động mới tạo ra giá trị mới. Hãy quản lý thời gian và năng lượng của bạn.",
    },
    {
      title: "Kết thúc đa tuyến",
      desc: "Tương lai của nhân loại nằm trong tay bạn: Giác ngộ hay tiếp tục bị nô dịch?",
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
