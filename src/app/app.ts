import { Component, signal, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
}

interface StepItem {
  id: number;
  title: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
  ratingStars?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  roadmap?: {
    incomeEst: string;
    roles: string[];
    steps: string[];
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements AfterViewChecked {
  private http = inject(HttpClient);

  // ⚠️ ЗАМЕНИТЕ НА ВАШ URL ИЗ n8n WEBHOOK:
  private n8nWebhookUrl = 'https://n8n.lessonstudy.asia/webhook/126e320c-dbe3-4432-aa1d-d4407d5485bb';

  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  showChat = signal<boolean>(false);

  navLinks = [
    { label: 'Басты бет', href: '#', active: true },
    { label: 'Мүмкіндіктер', href: '#features', active: false },
    { label: 'Қалай жұмыс істейді', href: '#how-it-works', active: false },
    { label: 'Пайдаланушылар', href: '#users', active: false },
    { label: 'Жиі қойылатын сұрақтар', href: '#faq', active: false }
  ];

  selectedLang = signal<string>('Қазақша');
  isLangMenuOpen = signal<boolean>(false);
  activeStep = signal<number>(1);

  features: FeatureCard[] = [
    {
      icon: 'search',
      title: 'Дағдыларыңды талдау',
      desc: 'AI технологиясы арқылы сенің дағдыларың мен әлеуетіңді бағалаймыз.'
    },
    {
      icon: 'target',
      title: 'Нарықпен салыстыру',
      desc: 'Сенің дағдыларыңды сұранысқа ие мүмкіндіктермен сәйкестендіреміз.'
    },
    {
      icon: 'doc',
      title: 'Жеке стратегия',
      desc: 'Сен үшін персонализацияланған табыс жоспарын жасаймыз.'
    },
    {
      icon: 'rocket',
      title: 'Нақты қадамдар',
      desc: 'Алғашқы табысыңа дейінгі нақты қадамдарды ұсынамыз және қолдаймыз.'
    }
  ];

  steps: StepItem[] = [
    {
      id: 1,
      title: 'Сенің дағдыларыңды енгіз',
      desc: 'Өзіңе ыңғайлы форматта (резюме, сауалнама немесе тікелей енгізу).'
    },
    {
      id: 2,
      title: 'AI талдау жасайды',
      desc: 'Жүйе сенің дағдыларыңды талдап, нарықтағы мүмкіндіктермен салыстырады.'
    },
    {
      id: 3,
      title: 'Жеке жоспар ал',
      desc: 'Сен үшін ең қолайлы бағыттар мен нақты қадамдар ұсынылады.'
    },
    {
      id: 4,
      title: 'Табысқа жет',
      desc: 'Бірінші тапсырысты алып, өз мүмкіндіктеріңді кеңейт!'
    }
  ];

  stats: StatItem[] = [
    { value: '50 000+', label: 'пайдаланушы' },
    { value: '5 000+', label: 'табысқа жеткен' },
    { value: '4.9', label: 'пайдаланушылар пікірі', ratingStars: 5 }
  ];

  userInput = signal<string>('');
  isAiTyping = signal<boolean>(false);

  quickSkills = [
    'Python & Анализ данных',
    'Figma & UI/UX дизайн',
    'SMM & Контент маркетинг',
    'Ағылшын тілі / Аударма',
    'Копирайтинг & Мәтіндер',
    'Web-әзірлеу (HTML/CSS/JS)'
  ];

  chatMessages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Сәлем ! Мен Skill to Income AI-ассистентімін (n8n LLM интеграциясы). Өз дағдыларыңды жаз, мен нақты нарықтық жоспар ұсынамын.',
      timestamp: '12:00'
    }
  ]);

  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.chatScrollContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  openChat(): void {
    this.showChat.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.shouldScrollToBottom = true;
  }

  closeChat(): void {
    this.showChat.set(false);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update(v => !v);
  }

  setLang(lang: string): void {
    this.selectedLang.set(lang);
    this.isLangMenuOpen.set(false);
  }

  setStep(stepId: number): void {
    this.activeStep.set(stepId);
  }

  selectSkillChip(skill: string): void {
    this.sendMessage(skill);
  }

  sendCurrentMessage(): void {
    const text = this.userInput().trim();
    if (text) {
      this.sendMessage(text);
      this.userInput.set('');
    }
  }

  sendMessage(text: string): void {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Отображаем сообщение пользователя в чате
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: timeNow
    };

    this.chatMessages.update(msgs => [...msgs, userMsg]);
    this.isAiTyping.set(true);
    this.shouldScrollToBottom = true;

    // 2. Отправляем реальный запрос в n8n Webhook
    this.http.post<any>(this.n8nWebhookUrl, {
      message: text,
      language: this.selectedLang()
    }).subscribe({
      next: (response) => {
        this.isAiTyping.set(false);
        this.handleN8nResponse(response, timeNow);
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        console.error('n8n error:', err);
        this.isAiTyping.set(false);
        
        // Фоллбэк-сообщение, если n8n временно оффлайн или не настроен URL
        this.chatMessages.update(msgs => [
          ...msgs,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: 'Кешіріңіз, n8n серверіне қосылу кезінде қате орын алды. URL мекенжайын немесе n8n жұмысын тексеріңіз.',
            timestamp: timeNow
          }
        ]);
        this.shouldScrollToBottom = true;
      }
    });
  }

  private handleN8nResponse(data: any, time: string): void {
    // Если n8n вернул строку или вложенный объект с текстом
    let responseText = data.text || data.output || (typeof data === 'string' ? data : JSON.stringify(data));
    let roadmapData = undefined;

    // Если n8n вернул поля для дорожной карты
    if (data.incomeEst || data.roles || data.steps) {
      roadmapData = {
        incomeEst: data.incomeEst || 'Келісімді',
        roles: Array.isArray(data.roles) ? data.roles : [data.roles],
        steps: Array.isArray(data.steps) ? data.steps : [data.steps]
      };
    }

    const aiMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: responseText,
      timestamp: time,
      roadmap: roadmapData
    };

    this.chatMessages.update(msgs => [...msgs, aiMsg]);
  }

  private scrollToBottom(): void {
    try {
      this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
    } catch {}
  }
}