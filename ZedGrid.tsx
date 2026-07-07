/**
 * ZedGrid — воспроизведение фоновой "сетки" с сайта zed.dev
 *
 * ВАЖНО: у Zed сетка сделана НЕ через background-image / repeating-linear-gradient.
 * Сетка — это композиция DOM-элементов:
 *   1. Body получает базовый фон + шумовую текстуру (noise .webp, opacity ~0.03).
 *   2. Две вертикальные полосы (left/right) — окрашенные div'ы с border на внутренней стороне.
 *   3. Горизонтальные линии — псевдоэлементы ::before у секций, тянутся на 200vw (чтобы линия шла за пределы контейнера).
 *   4. На пересечениях линий стоят маленькие ромбы (6x6, rotate-45), позиционируются CSS-переменными.
 *
 * Задача для тебя: собрать hero-секцию используя примитивы ниже.
 * Разбери каждый примитив — комментарии объясняют ЧТО и ПОЧЕМУ. Дальше собирай сам.
 */

import { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  ПРИМИТИВ 1: DiamondNode — узел-ромб на пересечении линий          */
/* ------------------------------------------------------------------ */
/**
 * У Zed это маленький квадрат 6x6px, повёрнутый на 45° (получается ромб).
 * border 1px + белая заливка = ощущение "точки пересечения".
 * Позиция задана относительно родителя через CSS-переменные:
 *   --node-vertical-offset (у Zed = 3.5px)
 *   --node-horizontal-offset (12.5 / 19.5 / 43.5 / 45.5 в зависимости от breakpoint)
 *
 * Пропсы position определяют в какой угол ставить ромб.
 * Пойми, ПОЧЕМУ используется calc(-1 * var(...)): чтобы вынести ромб ЗА границу контейнера
 * ровно на половину его размера — так центр ромба ложится на линию border'а.
 */
type DiamondPosition = "tl" | "tr" | "bl" | "br";

export function DiamondNode({ position }: { position: DiamondPosition }) {
  // Собери классы позиционирования сам. Подсказка:
  //   top-угол  → top:calc(-1 * var(--node-vertical-offset))
  //   left-угол → left:var(--node-horizontal-offset)
  // Tailwind позволяет писать arbitrary values через [ ].
  const positionClass = {
    tl: "[top:calc(-1*var(--node-vertical-offset))] [left:var(--node-horizontal-offset)]",
    tr: "[top:calc(-1*var(--node-vertical-offset))] [right:var(--node-horizontal-offset)]",
    bl: "[bottom:calc(-1*var(--node-vertical-offset))] [left:var(--node-horizontal-offset)]",
    br: "[bottom:calc(-1*var(--node-vertical-offset))] [right:var(--node-horizontal-offset)]",
  }[position];

  return (
    <div
      className={`absolute z-[99] size-1.5 rotate-45 border border-neutral-300 bg-white ${positionClass}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ПРИМИТИВ 2: NavStrip — вертикальная боковая полоса                */
/* ------------------------------------------------------------------ */
/**
 * У Zed это два цветных столбца по краям экрана.
 * Ширина responsive: 16px / 24px / 48px (мобилка / планшет / десктоп).
 * Именно border на внутренней стороне полосы создаёт вертикальную линию сетки.
 *
 * Подумай: почему border-r у левой полосы и border-l у правой?
 * (Ответ: линия должна быть между полосой и контентом. Значит на "внутренней" стороне.)
 */
export function NavStrip({ side }: { side: "left" | "right" }) {
  const sideClass =
    side === "left"
      ? "left-0 border-r border-neutral-300"
      : "right-0 border-l border-neutral-300";

  return (
    <div
      className={`pointer-events-none absolute top-0 bottom-0 z-[-1] w-4 sm:w-6 md:w-12 bg-neutral-50 ${sideClass}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ПРИМИТИВ 3: HorizontalDivider — горизонтальная линия              */
/* ------------------------------------------------------------------ */
/**
 * Секция с ::before, который тянется на 200vw и смещён на -100vw влево.
 * Зачем 200vw? Чтобы линия гарантированно перекрыла всю ширину экрана
 * даже если родитель имеет max-width или padding.
 * height: 1px. Позиционируется абсолютно относительно секции.
 *
 * Twist: класс `before:` в Tailwind — псевдоэлемент. content-[''] обязателен, иначе не отрисуется.
 */
export function HorizontalDivider({ children }: { children?: ReactNode }) {
  return (
    <section
      className="
        relative
        before:content-['']
        before:absolute before:top-0 before:-left-[100vw]
        before:h-px before:w-[200vw]
        before:bg-neutral-300
        before:z-[-1]
      "
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ПРИМИТИВ 4: ZedGrid — обёртка страницы                            */
/* ------------------------------------------------------------------ */
/**
 * Что делает:
 *   - задаёт CSS-переменные --node-vertical-offset / --node-horizontal-offset
 *     (responsive: у Zed 12.5 / 19.5 / 43.5 / 45.5 через media queries)
 *   - рендерит две NavStrip по бокам
 *   - оставляет slot для контента (children)
 *
 * Что НЕ делает (для тебя задание):
 *   - noise texture overlay. Zed берёт .webp с ~5% opacity. Хочешь — добавь <div> с
 *     background-image, opacity-[0.03], pointer-events-none, absolute inset-0, z-[-1].
 *   - горизонтальные разделители между секциями. Внутри children используй <HorizontalDivider>.
 *   - ромбы на пересечениях. Клади <DiamondNode> внутрь секций где нужны углы.
 */
export function ZedGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        relative min-h-screen w-full overflow-x-hidden bg-neutral-100
        [--node-vertical-offset:3.5px]
        [--node-horizontal-offset:12.5px]
        sm:[--node-horizontal-offset:19.5px]
        md:[--node-horizontal-offset:43.5px]
        lg:[--node-horizontal-offset:45.5px]
      "
    >
      <NavStrip side="left" />
      <NavStrip side="right" />

      {/* TODO(ты): noise overlay. bg-repeat + opacity-[0.03] + inset-0 absolute z-[-1] */}

      <main className="relative">{children}</main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ПРИМЕР сборки (не финальный — доделай сам)                        */
/* ------------------------------------------------------------------ */
/**
 * Задание:
 *   1. Оберни страницу в <ZedGrid>.
 *   2. Разбей контент на секции <HorizontalDivider>.
 *   3. В каждой секции с relative — поставь 4 <DiamondNode> (tl, tr, bl, br)
 *      если хочешь углы.
 *   4. Проверь на mobile / tablet / desktop — offsets должны меняться.
 *
 * Пример скелета (раскомментируй и допиши):
 *
 * export default function Demo() {
 *   return (
 *     <ZedGrid>
 *       <HorizontalDivider>
 *         <div className="relative min-h-[450px] px-4 sm:px-6 md:px-12">
 *           <DiamondNode position="tl" />
 *           <DiamondNode position="tr" />
 *           <DiamondNode position="bl" />
 *           <DiamondNode position="br" />
 *           {/* твой hero-контент */}
 *         </div>
 *       </HorizontalDivider>
 *     </ZedGrid>
 *   );
 * }
 */
