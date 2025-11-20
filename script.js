const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const fontSizeInput = document.getElementById('font-size');
const btnHelp = document.getElementById('btn-help');

// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
    },
    options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
    },
    output: {
        font: 'mathjax-modern'
    }
};

// Initialize Mermaid with a cleaner, educational theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '16px',
        primaryColor: '#ffffff',
        primaryBorderColor: '#007bff',
        primaryTextColor: '#333',
        lineColor: '#666',
        mainBkg: '#ffffff',
        nodeBorder: '#007bff'
    },
    flowchart: {
        curve: 'basis', // Smooth curves or 'linear' for sharp lines
        padding: 20
    }
});

// Debounce function to avoid excessive rendering
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Main render function
const render = debounce(() => {
    let markdownText = editor.value;

    // Pre-process: Detect $$ar ... $$ and wrap in specific container for Arabic RTL styling
    // We do this before markdown parsing so it becomes HTML
    markdownText = markdownText.replace(/\$\$ar\s([\s\S]*?)\$\$/g, '<div class="arabic-math">$$$1$$</div>');
    markdownText = markdownText.replace(/\$ar\s(.*?)\$/g, '<span class="arabic-math">$$$1$$</span>');

    // 1. Convert Markdown to HTML
    let html = marked.parse(markdownText);

    // 2. Process Mermaid Blocks
    // We look for <pre><code class="language-mermaid">...</code></pre> which marked.js produces
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const mermaidBlocks = tempDiv.querySelectorAll('code.language-mermaid');
    mermaidBlocks.forEach((block, index) => {
        const graphDefinition = block.textContent;
        const pre = block.parentElement;
        const div = document.createElement('div');
        div.classList.add('mermaid');
        div.textContent = graphDefinition;
        div.id = `mermaid-chart-${index}`;
        pre.replaceWith(div);
    });

    preview.innerHTML = tempDiv.innerHTML;

    // 3. Render Mermaid
    mermaid.run({
        querySelector: '.mermaid'
    });

    // 4. Render MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
    }
}, 300);

// Event Listeners
editor.addEventListener('input', render);

fontSizeInput.addEventListener('input', (e) => {
    const size = e.target.value + 'px';
    document.documentElement.style.setProperty('--font-size', size);
});

// Help Content
const helpContent = `
# دليل الاستخدام (User Guide)

مرحباً بك في المحرر الشامل! يمكنك هنا كتابة شروحات، معادلات رياضية، وخرائط ذهنية بأسلوب Markdown.

## 1. تنسيق النصوص (Text Formatting)
- **نص عريض**: \`**نص هنا**\`
- *نص مائل*: \`*نص هنا*\`
- عناوين: \`# عنوان كبير\`, \`## عنوان فرعي\`
- قوائم نقطية: \`- عنصر\`
- قوائم رقمية: \`1. عنصر\`

## 2. المعادلات الرياضية (Math Equations)
لكتابة المعادلات، استخدم علامة الدولار \`$\`.
- معادلة في نفس السطر: $E = mc^2$
- كتلة معادلة:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### المعادلات العربية (Arabic Math - RTL)
لعرض المعادلات بالاتجاه العربي الصحيح (من اليمين لليسار) وقلب إشارة الجذر، ابدأ المعادلة بـ \`$$ar\`.

**القانون العام (معكوس لليمين):**
$$ar
\\text{س} = \\frac{-\\text{ب} \\pm \\sqrt{\\text{ب}^2 - 4\\text{أ}\\text{ج}}}{2\\text{أ}}
$$

**لاحظ:** الكلمة \`ar\` تخبر الموقع أن هذه معادلة عربية بالكامل.

**أمثلة أخرى:**
- أسس عربية: $$ar \\text{س}^2 + \\text{ص}^2 = 25 $$

## 3. الخرائط الذهنية (Mind Maps & Diagrams)
استخدم كود \`mermaid\` لرسم المخططات.

### مثال 1: خريطة انسيابية (Flowchart)
\`\`\`mermaid
graph TD
    A[البداية] --> B{هل الدرس مفهوم؟}
    B -- نعم --> C[انتقل للتالي]
    B -- لا --> D[راجع الشرح]
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
\`\`\`

### مثال 2: خريطة ذهنية (Mindmap)
\`\`\`mermaid
mindmap
  root((العلوم))
    الفيزياء
      القوى
      الحركة
    الكيمياء
      الذرة
      التفاعلات
\`\`\`

## 4. الجداول (Tables)

| الاسم | الوظيفة | الراتب |
|-------|---------|--------|
| أحمد  | مهندس   | 5000   |
| سارة  | طبيبة   | 7000   |

---
استخدم الشريط العلوي لتغيير حجم الخط.
`;

btnHelp.addEventListener('click', () => {
    editor.value = helpContent;
    render();
});

// Initial Render
editor.value = helpContent; // Start with help content
render();
