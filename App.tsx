import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeGemini, validateApiKey, generateStudentReport } from './services/geminiService';
import { 
    UserGroupIcon, DocumentTextIcon, CheckBadgeIcon, DocumentPlusIcon, ArrowLeftIcon, ArrowRightIcon, 
    CheckIcon, SparklesIcon, SaveIcon, UploadIcon, DownloadIcon, TrashIcon, RefreshCwIcon, InfoIcon, XIcon
} from './components/Icons';

// --- Data (as provided in the original HTML) ---
const unitAchievements = {
  '중1': {
    '소인수분해': [{ code: '9수01-01', content: '소인수분해를 이용하여 최대공약수와 최소공배수를 구할 수 있다.' }, { code: '9수01-02', content: '정수와 유리수의 개념을 이해하고, 수의 대소 관계를 비교할 수 있다.' }],
    '정수와 유리수': [{ code: '9수01-03', content: '정수와 유리수의 덧셈과 뺄셈의 원리를 이해하고 계산할 수 있다.' }, { code: '9수01-04', content: '정수와 유리수의 곱셈과 나눗셈의 원리를 이해하고 계산할 수 있다.' }, { code: '9수01-05', content: '정수와 유리수의 사칙연산이 혼합된 계산의 순서를 알고 계산할 수 있다.' }],
    '문자의 사용과 식': [{ code: '9수02-01', content: '문자를 사용하여 식을 간단히 나타낼 수 있다.' }, { code: '9수02-02', content: '단항식의 곱셈과 나눗셈의 원리를 이해하고 계산할 수 있다.' }],
    '일차방정식': [{ code: '9수02-03', content: '일차방정식의 개념과 풀이 방법을 이해하고 문제를 해결할 수 있다.' }, { code: '9수02-04', content: '일차방정식을 활용하여 다양한 실생활 문제를 해결할 수 있다.' }],
    '좌표평면과 그래프': [{ code: '9수02-05', content: '좌표평면 위의 점의 좌표를 이해하고, 이를 이용하여 문제를 해결할 수 있다.' }, { code: '9수02-06', content: '정비례 관계의 의미를 알고, 그 그래프를 그릴 수 있다.' }, { code: '9수02-07', content: '반비례 관계의 의미를 알고, 그 그래프를 그릴 수 있다.' }],
    '기본도형': [{ code: '9수03-01', content: '점, 선, 면의 관계를 이해하고, 다양한 기본 도형을 관찰하여 문제를 해결할 수 있다.' }, { code: '9수03-02', content: '각의 개념을 이해하고, 평행선의 성질을 활용하여 문제를 해결할 수 있다.' }],
    '작도와 합동': [{ code: '9수03-03', content: '삼각형의 작도와 합동의 원리를 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수03-04', content: '평행선과 엇각, 동위각의 성질을 이해하고, 이를 도형의 성질 증명에 활용할 수 있다.' }],
    '평면도형의 성질': [{ code: '9수03-05', content: '다각형의 성질을 이해하고, 내각과 외각의 크기를 구할 수 있다.' }, { code: '9수03-06', content: '원과 부채꼴의 성질을 이해하고, 호의 길이와 넓이를 계산할 수 있다.' }],
    '입체도형의 성질': [{ code: '9수03-07', content: '다양한 입체도형의 특징을 이해하고, 겉넓이와 부피를 구할 수 있다.' }, { code: '9수03-08', content: '회전체와 단면의 특징을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }],
    '대푯값': [{ code: '9수04-01', content: '도수분포표, 히스토그램, 도수분포다각형을 이해하고 작성할 수 있다.' }, { code: '9수04-02', content: '자료를 막대그래프, 원그래프 등으로 나타내고 해석할 수 있다.' }, { code: '9수04-03', content: '상대도수의 개념을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수04-04', content: '자료를 수집하고 정리하여 경향성을 파악할 수 있다.' }],
  },
  '중2': {
    '유리수와 순환소수': [{ code: '9수01-06', content: '유리수와 순환소수의 관계를 이해하고, 이를 구분할 수 있다.' }],
    '식의 계산': [{ code: '9수02-08', content: '단항식과 다항식의 곱셈과 나눗셈을 할 수 있다.' }, { code: '9수02-09', content: '다항식의 덧셈과 뺄셈의 원리를 이해하고 계산할 수 있다.' }, { code: '9수02-10', content: '등식의 성질을 이해하고, 일차방정식의 풀이에 적용할 수 있다.' }],
    '일차부등식': [{ code: '9수02-11', content: '일차부등식의 의미와 풀이 방법을 이해하고, 수직선에 나타낼 수 있다.' }, { code: '9수02-12', content: '연립일차부등식을 풀고, 해를 수직선 위에 나타낼 수 있다.' }],
    '연립일차방정식': [{ code: '9수02-13', content: '연립일차방정식의 해를 구할 수 있고, 이를 활용하여 문제를 해결할 수 있다.' }],
    '일차함수와 그 그래프': [{ code: '9수02-14', content: '일차함수의 의미를 이해하고, 그 그래프를 그릴 수 있다.' }, { code: '9수02-15', content: '일차함수의 그래프의 기울기와 y절편의 의미를 이해하고, 그래프의 성질을 설명할 수 있다.' }, { code: '9수02-16', content: '일차함수의 그래프의 평행이동과 대칭이동을 이해하고, 그래프를 그릴 수 있다.' }],
    '일차함수와 일차방정식의 관계': [{ code: '9수02-17', content: '일차함수와 일차방정식의 관계를 이해하고, 그래프를 활용하여 문제를 해결할 수 있다.' }, { code: '9수02-18', content: '연립일차방정식의 해를 일차함수의 그래프를 이용하여 구할 수 있다.' }],
    '삼각형과 사각형의 성질': [{ code: '9수03-09', content: '삼각형의 내각과 외각의 성질을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수03-10', content: '이등변삼각형의 성질을 이해하고, 이를 증명할 수 있다.' }, { code: '9수03-11', content: '직각삼각형의 합동조건을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }],
    '도형의 닮음': [{ code: '9수03-12', content: '도형의 닮음의 개념을 이해하고, 닮음비를 구할 수 있다.' }, { code: '9수03-13', content: '삼각형의 닮음조건을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수03-14', content: '피타고라스 정리를 이해하고, 이를 증명할 수 있다.' }],
    '피타고라스 정리': [{ code: '9수03-15', content: '피타고라스 정리를 이해하고, 이를 증명할 수 있다.' }],
    '경우의 수와 확률': [{ code: '9수04-05', content: '경우의 수의 개념을 이해하고, 합의 법칙과 곱의 법칙을 활용할 수 있다.' }, { code: '9수04-06', content: '확률의 개념과 기본 성질을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }],
  },
  '중3': {
    '제곱근과 실수': [{ code: '9수01-07', content: '제곱근의 의미를 이해하고, 제곱근을 구할 수 있다.' }, { code: '9수01-08', content: '무리수와 실수의 개념을 이해하고, 실수의 대소 관계를 비교할 수 있다.' }, { code: '9수01-09', content: '제곱근의 곱셈과 나눗셈을 할 수 있다.' }, { code: '9수01-10', content: '제곱근의 덧셈과 뺄셈을 할 수 있다.' }],
    '다항식의 곱셈과 인수분해': [{ code: '9수02-19', content: '이차식의 인수분해의 원리를 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수02-20', content: '이차방정식의 의미를 이해하고, 그 해를 구할 수 있다.' }],
    '이차함수와 그 그래프': [{ code: '9수02-21', content: '이차함수의 의미를 이해하고, 그 그래프를 그릴 수 있다.' }, { code: '9수02-22', content: '이차함수 $y=ax^2+bx+c$ 의 그래프의 성질을 이해하고, 이를 활용할 수 있다.' }],
    '삼각비': [{ code: '9수03-16', content: '삼각비의 뜻을 알고, 직각삼각형에서 삼각비의 값을 구할 수 있다.' }, { code: '9수03-17', content: '삼각비를 활용하여 실생활 문제를 해결할 수 있다.' }],
    '원의 성질': [{ code: '9수03-18', content: '원의 현과 접선의 성질을 이해하고, 이를 활용하여 문제를 해결할 수 있다.' }, { code: '9수03-19', content: '원주각의 성질을 이해하고, 원주각의 크기를 구할 수 있다.' }],
    '산포도': [{ code: '9수04-07', content: '대푯값의 의미를 이해하고, 평균, 중앙값, 최빈값을 구할 수 있다.' }, { code: '9수04-08', content: '산포도의 의미를 이해하고, 분산과 표준편차를 구할 수 있다.' }, { code: '9수04-09', content: '산점도와 상관관계를 이해하고, 이를 분석할 수 있다.' }],
  },
};
const allAchievements = Object.values(unitAchievements).flatMap(grade => Object.values(grade)).flat();

// --- Types ---
type Student = { id: string; name: string; };
type Toast = { id: number; message: string; type: 'success' | 'error' };
type Grade = '중1' | '중2' | '중3' | '';

type AppState = {
    currentStep: number;
    students: Student[];
    studentInput: string;
    selectedGrade: Grade;
    selectedUnits: string[];
    stagedStudentAchievements: Record<string, Record<string, number>>;
    studentGuidelines: Record<string, { include: string; }>;
    generatedRecords: Record<string, string>;
    originalRecords: Record<string, string>;
    maxByteCount: number;
    achievementsPerStudent: number;
};

// --- Helper Functions ---
const getByteCount = (str: string) => new TextEncoder().encode(str).length;
const truncateBySentence = (text: string, maxBytes: number) => {
    if (getByteCount(text) <= maxBytes) return text;
    const sentences = text.match(/[^.!?]*[.!?]\s*/g) || [text];
    let truncatedText = '';
    let currentBytes = 0;
    for (const sentence of sentences) {
        const sentenceBytes = getByteCount(sentence);
        if (currentBytes + sentenceBytes > maxBytes) break;
        truncatedText += sentence;
        currentBytes += sentenceBytes;
    }
    if (truncatedText.length === 0 && text.length > 0) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder('utf-8', { fatal: true });
        let sliceIndex = maxBytes;
        while (sliceIndex > 0) {
            try {
                truncatedText = decoder.decode(encoder.encode(text).slice(0, sliceIndex));
                break;
            } catch (e) {
                sliceIndex--;
            }
        }
    }
    return truncatedText.trim();
};

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
    const [verificationMessage, setVerificationMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    
    const [appState, setAppState] = useState<AppState>({
        currentStep: 1,
        students: [],
        studentInput: '',
        selectedGrade: '',
        selectedUnits: [],
        stagedStudentAchievements: {},
        studentGuidelines: {},
        generatedRecords: {},
        originalRecords: {},
        maxByteCount: 1000,
        achievementsPerStudent: 3,
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [regeneratingStudentId, setRegeneratingStudentId] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string>('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);
    
    // --- API Key Handling ---
    useEffect(() => {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            setApiKeyInput(savedKey);
            showToast('저장된 API 키를 불러왔습니다.');
        }
    }, [showToast]);

    const handleApiKeySubmit = async () => {
        if (!apiKeyInput) {
            setVerificationMessage({ text: 'API 키를 입력해주세요.', type: 'error' });
            return;
        }
        setIsVerifyingKey(true);
        setVerificationMessage({ text: 'API 키 확인 중...', type: 'success' });
        const result = await validateApiKey(apiKeyInput);
        if (result.valid) {
            initializeGemini(apiKeyInput);
            setApiKey(apiKeyInput);
            localStorage.setItem('geminiApiKey', apiKeyInput);
            setVerificationMessage({ text: 'API 키가 확인되었습니다!', type: 'success' });
        } else {
            setVerificationMessage({ text: result.message || 'API 키가 유효하지 않습니다.', type: 'error' });
        }
        setIsVerifyingKey(false);
    };
    
    // --- Navigation ---
    const goToStep = (step: number) => {
        if (appState.currentStep === step) return;
         if (step > 1 && !appState.selectedGrade) {
            showToast('1단계: 학년을 먼저 선택해주세요.', 'error');
            return;
        }
        if (step > 1 && appState.students.length === 0) {
            showToast('1단계: 학생 명단을 먼저 등록해주세요.', 'error');
            return;
        }
        if (step > 2 && appState.selectedUnits.length === 0) {
            showToast('2단계: 단원을 하나 이상 선택해주세요.', 'error');
            return;
        }
        setAppState(prev => ({...prev, currentStep: step}));
    };
    
    // --- Step 1 Logic ---
    const handleStudentInput = () => {
        if (!appState.selectedGrade) {
            showToast('먼저 학년을 선택해주세요.', 'error');
            return;
        }
        const studentList = appState.studentInput.split('\n').map(line => line.trim()).filter(Boolean).map(name => ({ id: crypto.randomUUID(), name }));
        if (studentList.length === 0) {
            showToast('학생 명단을 입력해주세요.', 'error');
            return;
        }
        setAppState(prev => ({...prev, students: studentList}));
        showToast(`${studentList.length}명의 학생이 등록되었습니다.`);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!appState.selectedGrade) {
            showToast('먼저 학년을 선택해주세요.', 'error');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const studentNames = text.split(/[\n\r]+/).map(line => line.trim()).filter(Boolean);
            const studentList = studentNames.map(name => ({ id: crypto.randomUUID(), name }));
            setAppState(prev => ({
                ...prev,
                studentInput: studentNames.join('\n'),
                students: studentList
            }));
            showToast('CSV 파일에서 학생 명단이 성공적으로 등록되었습니다.');
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleDownloadTemplate = () => {
        const csvContent = "\uFEFF" + "이름\n김민준\n이서연\n박도윤\n";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "학생명단_양식.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    // --- Step 2 Logic ---
    const toggleUnit = (unit: string) => {
        setAppState(prev => {
            const newSelectedUnits = prev.selectedUnits.includes(unit)
                ? prev.selectedUnits.filter(u => u !== unit)
                : [...prev.selectedUnits, unit];
            return { ...prev, selectedUnits: newSelectedUnits };
        });
    };

    // --- Step 3 Logic ---
    const availableAchievements = useMemo(() => {
      if (!appState.selectedGrade) return [];
      const achievementMap = new Map();
      appState.selectedUnits
          .flatMap(unit => (unitAchievements[appState.selectedGrade]?.[unit] || []).map(ach => ({ ...ach, unit })))
          .forEach(ach => {
              if (!achievementMap.has(ach.code)) achievementMap.set(ach.code, ach);
          });
      return Array.from(achievementMap.values());
    }, [appState.selectedGrade, appState.selectedUnits]);

    const globalAchievementCount = useMemo(() => {
      const counts: Record<string, number> = {};
      Object.values(appState.stagedStudentAchievements).forEach(achievements => {
        Object.keys(achievements).forEach(code => {
          counts[code] = (counts[code] || 0) + 1;
        });
      });
      return counts;
    }, [appState.stagedStudentAchievements]);

    const maxGlobalDuplication = useMemo(() => {
        if (availableAchievements.length === 0 || appState.students.length === 0) return 1;
        return Math.max(1, Math.ceil((appState.students.length * appState.achievementsPerStudent) / availableAchievements.length));
    }, [appState.students.length, appState.achievementsPerStudent, availableAchievements.length]);
    
    const handleAchievementToggle = (studentId: string, code: string) => {
        setAppState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            const studentSelections = newState.stagedStudentAchievements[studentId] || {};
            if (studentSelections[code]) {
                delete studentSelections[code];
            } else {
                if (Object.keys(studentSelections).length < prev.achievementsPerStudent) {
                    studentSelections[code] = 1;
                } else {
                    showToast(`학생당 최대 ${prev.achievementsPerStudent}개의 성취기준만 선택할 수 있습니다.`, 'error');
                }
            }
            newState.stagedStudentAchievements[studentId] = studentSelections;
            return newState;
        });
    };

    const autoAssignAchievements = () => {
        if (availableAchievements.length === 0) {
            showToast('선택된 단원에 해당하는 성취기준이 없습니다.', 'error');
            return;
        }
        
        let achievementIndex = 0;
        const newStagedAchievements: AppState['stagedStudentAchievements'] = {};
        appState.students.forEach(student => {
            newStagedAchievements[student.id] = {};
            for (let i = 0; i < appState.achievementsPerStudent; i++) {
                const code = availableAchievements[achievementIndex % availableAchievements.length].code;
                newStagedAchievements[student.id][code] = 1;
                achievementIndex++;
            }
        });
        setAppState(prev => ({...prev, stagedStudentAchievements: newStagedAchievements}));
        showToast('성취기준이 자동으로 배정되었습니다.');
    };

    // --- Step 4 Logic ---
    const fixedInclude = [
        '교사의 관찰자 시점에서 학생의 행동과 역량을 중심으로 서술함.',
        '성취기준의 핵심 역량을 문장에 자연스럽게 녹여내어 서술함.',
        '문장 끝은 명사형 어미("-함", "-음", "-됨", "-임")로 종결하여 객관성을 유지함.',
        '구체적 관찰 사실과 행동 특성을 서술한 후, 그를 통해 드러나는 역량과 태도를 연결하여 작성함.',
        '학업역량(자기주도성, 탐구심), 인성(성실성, 책임감), 사회성(협력, 소통) 등 다양한 강점이 수학 교과와 관련하여 드러나도록 작성함.',
        '긍정적 변화와 성장 과정을 강조하여 학생의 개별적 특성이 잘 나타나도록 함.',
        '문법적으로 완벽하고 자연스러운 한국어 문장을 구사하며, 특히 조사를 정확하게 사용함. (예: "정확성 돋보임" -> "정확성이 돋보임")',
        '추상적인 칭찬(예: \'뛰어남\', \'우수함\')보다는 구체적인 사례를 통해 역량이 드러나도록 서술함.',
        '너무 길지 않은 간단명료한 문장으로 서술함.'
    ];
    const fixedExclude = [
        '성취기준의 문장을 그대로 옮겨 적지 않음.',
        '\'학생\', \'대회\', \'평가\'와 같은 단어의 직접적인 사용은 금지함.',
        '특수기호는 사용하지 않음.',
        '추측이나 과장된 표현은 사용하지 않음.',
        '따옴표 안에 문장이 오는 형태는 지양함.'
    ];

    const generatePromptForStudent = (studentId: string) => {
        const achievementDetails = Object.keys(appState.stagedStudentAchievements[studentId] || {}).map(code => {
            return allAchievements.find(a => a.code === code)?.content || code;
        }).join('; ');

        const studentGuidelines = appState.studentGuidelines[studentId] || { include: '' };
        return `중학교 ${appState.selectedGrade} 수학 과목의 세부능력 및 특기사항을 작성해줘. 다음 성취기준을 활용해서 문장을 자연스럽게 연결해줘.
**선택된 성취기준:** ${achievementDetails}
**작성 지침:**
- 다음 내용은 반드시 포함해: 
${fixedInclude.map(item => `  - ${item}`).join('\n')}
${studentGuidelines.include ? `- 학생 개별 포함 내용:\n  - ${studentGuidelines.include}` : ''}
- 다음 내용은 절대 포함하지 말아줘:
${fixedExclude.map(item => `  - ${item}`).join('\n')}
**요구사항:** 특기사항은 한 문단으로 작성하고, 최대 ${appState.maxByteCount} 바이트에 가깝게, 하지만 절대 넘지 않도록 풍부하고 상세하게 작성해줘.`;
    };

    const handleGenerate = async () => {
         const studentsWithAchievements = appState.students.filter(s => Object.keys(appState.stagedStudentAchievements[s.id] || {}).length > 0);
        if (studentsWithAchievements.length === 0) {
            showToast('특기사항을 생성할 학생이 없습니다. 3단계에서 성취기준을 배정해주세요.', 'error');
            return;
        }

        setIsLoading(true);
        setGenerationStatus('생성 준비 중...');
        setAppState(prev => ({ ...prev, generatedRecords: {}, originalRecords: {} }));

        let processedCount = 0;
        
        for (const student of studentsWithAchievements) {
            processedCount++;
            setGenerationStatus(`${student.name} (${processedCount}/${studentsWithAchievements.length}) 생성 중...`);
            const prompt = generatePromptForStudent(student.id);

            try {
                const resultText = await generateStudentReport(prompt);
                const finalText = truncateBySentence(resultText, appState.maxByteCount);
                setAppState(prev => ({
                    ...prev,
                    generatedRecords: { ...prev.generatedRecords, [student.id]: finalText },
                    originalRecords: { ...prev.originalRecords, [student.id]: finalText },
                }));
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
                 setAppState(prev => ({
                    ...prev,
                    generatedRecords: { ...prev.generatedRecords, [student.id]: `생성 실패: ${errorMessage}` },
                }));
                 console.error(`Error for ${student.name}:`, error);
            }
        }
        
        setIsLoading(false);
        setGenerationStatus('');
        showToast('특기사항 생성이 완료되었습니다.');
    };

    const handleRegenerate = async (studentId: string) => {
        if (isLoading || regeneratingStudentId) return;

        setRegeneratingStudentId(studentId);
        const student = appState.students.find(s => s.id === studentId);
        if (!student) return;

        const prompt = generatePromptForStudent(studentId);
        try {
            const resultText = await generateStudentReport(prompt);
            const finalText = truncateBySentence(resultText, appState.maxByteCount);
            setAppState(prev => ({
                ...prev,
                generatedRecords: { ...prev.generatedRecords, [studentId]: finalText },
                originalRecords: { ...prev.originalRecords, [studentId]: finalText },
            }));
            showToast(`${student.name} 학생의 특기사항을 재생성했습니다.`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
            setAppState(prev => ({
                ...prev,
                generatedRecords: { ...prev.generatedRecords, [studentId]: `생성 실패: ${errorMessage}` },
            }));
            showToast(`${student.name} 학생 재생성 중 오류 발생`, 'error');
            console.error(`Error for ${student.name}:`, error);
        } finally {
            setRegeneratingStudentId(null);
        }
    };

    const handleDownloadExcel = () => {
        if (appState.students.every(s => !appState.generatedRecords[s.id])) {
            showToast('다운로드할 데이터가 없습니다.', 'error');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "이름,세부능력 및 특기사항\n";
        appState.students.forEach(student => {
            const record = appState.generatedRecords[student.id] || '';
            const row = `"${student.name}","${record.replace(/"/g, '""')}"`;
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.href = encodedUri;
        link.download = "세특_결과.csv";
        link.click();
        showToast('CSV 파일 다운로드가 시작됩니다.');
    };
    
    // --- Render Logic ---
    if (!apiKey) {
        const messageColor = verificationMessage?.type === 'error' ? 'text-red-600' : 'text-green-600';
        return (
             <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col justify-center items-center text-center animate-fadeIn">
                <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-200 w-full">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">중학교 수학 세부능력 특기사항 작성기</h1>
                    <p className="text-gray-600 mb-8">Google Gemini AI를 활용하여 학생들의 수학 세부능력 및 특기사항을 자동으로 생성해주는 도구입니다.</p>
                    
                    <div className="text-left bg-gray-50 p-6 rounded-lg border mb-8">
                        <h2 className="font-bold text-lg mb-3">API 키가 필요한 이유</h2>
                        <p className="text-sm text-gray-700 mb-4">이 도구는 Google Gemini을 사용하여 학생 개개인에 맞는 특기사항 문장을 생성합니다. AI 모델을 사용하기 위해서는 개인별 사용 권한을 증명하는 API 키가 필요합니다.</p>
                        <h2 className="font-bold text-lg mb-3">API 키 발급 방법</h2>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                            <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline hover:text-blue-800">Google AI Studio</a>에 접속하여 Google 계정으로 로그인합니다.</li>
                            <li>'API 키 만들기' 버튼을 클릭하여 새로운 키를 발급받습니다.</li>
                            <li>생성된 키를 복사하여 아래 입력창에 붙여넣어 주세요.</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-4">※ API 키는 사용자의 브라우저(로컬 저장소)에만 저장되며, 외부 서버로 전송되지 않습니다.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="여기에 Gemini API 키를 붙여넣으세요" className="w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                        {verificationMessage && <p className={`text-sm ${messageColor} font-semibold`}>{verificationMessage.text}</p>}
                        <button onClick={handleApiKeySubmit} disabled={isVerifyingKey} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-blue-600 text-white text-lg font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition">
                            {isVerifyingKey ? (
                                <>
                                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>확인 중...</span>
                                </>
                            ) : (
                                <span>시작하기</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const steps = [
        { number: 1, title: '학년 및 학생 명단', icon: <UserGroupIcon className="w-6 h-6"/> },
        { number: 2, title: '단원 선택', icon: <DocumentTextIcon className="w-6 h-6"/> },
        { number: 3, title: '성취기준 배정', icon: <CheckBadgeIcon className="w-6 h-6"/> },
        { number: 4, title: '특기사항 생성', icon: <DocumentPlusIcon className="w-6 h-6"/> },
    ];
    
    return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
       {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-md shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} animate-slideInRight`}>
            {toast.message}
          </div>
        ))}
      </div>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          중학교 수학 세부능력 특기사항 작성기
          <span className="text-lg text-gray-600 font-normal"> (Gemini 2.5 Pro)</span>
        </h1>
      </header>
      <main>
        {/* Stepper */}
        <div className="flex items-start justify-between mb-10">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex-1 min-w-0 flex flex-col items-center cursor-pointer" onClick={() => goToStep(step.number)}>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-colors duration-300 ${appState.currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {step.icon}
                        </div>
                        <div className={`mt-2 text-sm font-semibold transition-colors duration-300 ${appState.currentStep === step.number ? 'text-blue-600' : 'text-gray-500'}`}>STEP {step.number}</div>
                        <div className={`mt-1 text-xs text-center transition-colors duration-300 ${appState.currentStep === step.number ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>{step.title}</div>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 self-center mt-[-3rem] ${appState.currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
            ))}
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
           {appState.currentStep === 1 && (
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">학년 선택</label>
                    <select value={appState.selectedGrade} onChange={e => setAppState(prev => ({...prev, selectedGrade: e.target.value as Grade, selectedUnits: [], stagedStudentAchievements: {}}))} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition">
                        <option value="">학년을 선택하세요</option>
                        <option value="중1">중1</option>
                        <option value="중2">중2</option>
                        <option value="중3">중3</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">학생 명단 입력</label>
                    <textarea value={appState.studentInput} onChange={e => setAppState(prev => ({...prev, studentInput: e.target.value}))} placeholder="김철수&#10;이영희&#10;박민수" className="w-full h-32 p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition"></textarea>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={handleStudentInput} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">명단 등록</button>
                    </div>
                    <div className="border-t pt-3 mt-4">
                        <label className="text-sm text-gray-600 block mb-2">CSV 파일로 명단 관리</label>
                         <div className="flex items-center gap-3">
                            <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleFileUpload} />
                            <label htmlFor="csv-upload" className="flex-1 cursor-pointer px-4 py-2 text-center bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition flex items-center justify-center gap-2">
                                <UploadIcon className="w-5 h-5" /> CSV 파일 업로드
                            </label>
                            <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition flex items-center gap-2">
                                <DownloadIcon className="w-5 h-5"/> 양식 다운로드
                            </button>
                        </div>
                    </div>
                </div>
                {appState.students.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-md shadow-sm">
                        <h3 className="font-medium text-green-800">등록된 학생 ({appState.students.length}명)</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {appState.students.map(student => <span key={student.id} className="px-2 py-1 bg-green-200 text-green-800 rounded-lg text-sm font-medium">{student.name}</span>)}
                        </div>
                    </div>
                )}
            </div>
           )}
           {appState.currentStep === 2 && (
             <div className="space-y-6">
                {!appState.selectedGrade ? <div className="text-center text-gray-500">1단계에서 학년을 먼저 선택해주세요.</div> : (
                    <>
                        <div className="bg-indigo-50 p-4 rounded-md shadow-sm">
                            <h3 className="font-medium text-indigo-800">{appState.selectedGrade} 수학 단원 목록</h3>
                            <p className="text-sm text-indigo-600 mt-1">작성할 특기사항에 해당하는 단원을 선택하세요. (다중 선택 가능)</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(unitAchievements[appState.selectedGrade] || {}).map(unit => (
                                <button key={unit} onClick={() => toggleUnit(unit)} className={`p-4 rounded-lg text-left shadow-sm transition transform hover:scale-105 ${appState.selectedUnits.includes(unit) ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-300' : 'bg-white border border-gray-300 text-gray-700'}`}>
                                    {unit}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
           )}
           {appState.currentStep === 3 && (
            <div className="space-y-8">
                {appState.students.length === 0 || appState.selectedUnits.length === 0 ? <div className="text-center text-gray-500">1단계와 2단계를 먼저 완료해주세요.</div> : (
                <>
                <div className="bg-gray-100 p-6 rounded-xl shadow-inner border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">성취기준 배정 설정</h3>
                    <p className="text-sm text-gray-600 mb-4">자동 배정 시 학생당 개수에 맞춰 성취기준이 균등하게 배분됩니다.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="achievements-per-student" className="block text-sm font-medium text-gray-700 mb-2">학생당 성취기준 개수</label>
                            <input id="achievements-per-student" type="number" min="1" value={appState.achievementsPerStudent} onChange={e => setAppState(prev => ({...prev, achievementsPerStudent: parseInt(e.target.value) || 1}))} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition" />
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={autoAssignAchievements} className="w-full max-w-sm px-6 py-3 rounded-md shadow-md text-white transition transform flex items-center justify-center mx-auto gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <CheckIcon className="w-5 h-5"/> 자동 배정
                        </button>
                    </div>
                </div>
                {appState.students.map(student => {
                    const studentCount = Object.keys(appState.stagedStudentAchievements[student.id] || {}).length;
                    const hasAllotment = studentCount === appState.achievementsPerStudent;
                    return (
                        <div key={student.id} className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <h4 className="text-xl font-bold text-gray-800">{student.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${hasAllotment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>선택: {studentCount} / {appState.achievementsPerStudent}</span>
                            </div>
                            <div className="space-y-3">
                                {availableAchievements.map(achievement => {
                                    const isSelected = !!appState.stagedStudentAchievements[student.id]?.[achievement.code];
                                    const globalCount = globalAchievementCount[achievement.code] || 0;
                                    const isGloballyFull = globalCount >= maxGlobalDuplication;
                                    const isStudentFull = studentCount >= appState.achievementsPerStudent && !isSelected;
                                    const isDisabled = (isGloballyFull && !isSelected) || isStudentFull;
                                    return (
                                        <label key={achievement.code} className={`flex items-start p-3 rounded-lg border transition ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200 hover:border-blue-300'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => handleAchievementToggle(student.id, achievement.code)} className="form-checkbox h-5 w-5 rounded transition mt-1" />
                                            <p className="text-sm text-gray-800 flex-1 ml-4"><span className="font-semibold mr-2">[${achievement.code}]</span>{achievement.content}<span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">총 {globalCount}회</span></p>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                </>
                )}
            </div>
           )}
           {appState.currentStep === 4 && (
             <div className="space-y-6">
                <div className="border-t pt-6">
                    <div className="mb-6">
                        <label htmlFor="max-byte-count" className="block text-sm font-medium text-gray-700 mb-2">최대 바이트 수 (한글 1자=3바이트)</label>
                        <input id="max-byte-count" type="number" min="1" value={appState.maxByteCount} onChange={e => setAppState(prev => ({...prev, maxByteCount: parseInt(e.target.value) || 1}))} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition" />
                    </div>
                    <div className="text-center pt-6 border-t">
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full max-w-sm px-6 py-3 rounded-md shadow-md flex items-center justify-center gap-2 transition transform bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait">
                           {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              <span>{generationStatus}</span>
                            </>
                            ) : (
                                <> <SparklesIcon className="w-5 h-5" /> 특기사항 생성 </>
                            )}
                        </button>
                    </div>
                </div>
                  <div className="space-y-4 pt-6 mt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-2xl font-bold text-gray-900">특기사항 입력 및 결과</h4>
                         <button onClick={handleDownloadExcel} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition flex items-center gap-2 text-sm">
                            <DownloadIcon className="w-4 h-4" /> 엑셀 파일로 다운로드 (.csv)
                        </button>
                    </div>
                    {appState.students.map(student => {
                        const record = appState.generatedRecords[student.id] || '';
                        const byteCount = getByteCount(record);
                        const isRegenerating = regeneratingStudentId === student.id;
                        return (
                            <div key={student.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-lg">{student.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium">바이트 수: <span className={`byte-count font-bold ${byteCount > appState.maxByteCount ? 'text-red-500' : 'text-green-600'}`}>{byteCount}</span> / {appState.maxByteCount}</div>
                                        <button 
                                            onClick={() => handleRegenerate(student.id)} 
                                            disabled={isLoading || !!regeneratingStudentId}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isRegenerating ? (
                                                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <SparklesIcon className="w-3 h-3"/>
                                            )}
                                            재생성
                                        </button>
                                        <button onClick={() => {
                                            const original = appState.originalRecords[student.id];
                                            if (original) {
                                                setAppState(prev => ({...prev, generatedRecords: {...prev.generatedRecords, [student.id]: original}}));
                                                showToast(`${student.name} 학생의 특기사항이 복구되었습니다.`);
                                            } else {
                                                showToast('복구할 원본 데이터가 없습니다.', 'error');
                                            }
                                        }} className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition flex items-center gap-1 text-xs">
                                            <RefreshCwIcon className="w-3 h-3"/> 복구
                                        </button>
                                    </div>
                                </div>
                                {Object.keys(appState.stagedStudentAchievements[student.id] || {}).length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="text-xs text-gray-500 flex flex-wrap gap-1 mb-2">
                                            {Object.keys(appState.stagedStudentAchievements[student.id] || {}).map(code => <span key={code} className="bg-gray-200 px-2 py-1 rounded font-mono">{code}</span>)}
                                        </div>
                                        <textarea value={record} onChange={e => setAppState(prev => ({...prev, generatedRecords: {...prev.generatedRecords, [student.id]: e.target.value}}))} className="record-textarea w-full h-40 p-3 bg-white rounded-md border text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="AI가 생성할 특기사항 결과가 여기에 표시됩니다."/>
                                        <div className="mt-4 grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">개별 포함 내용 (선택)</label>
                                                <textarea value={appState.studentGuidelines[student.id]?.include || ''} onChange={e => setAppState(prev => ({...prev, studentGuidelines: {...prev.studentGuidelines, [student.id]: { include: e.target.value }}}))} className="w-full h-24 p-2 bg-white rounded-md border text-gray-800 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="예: 문제 해결 과정이 논리적임" />
                                            </div>
                                        </div>
                                    </div>
                                ) : <p className="text-gray-500 italic">이 학생에게 배정된 성취기준이 없습니다. 3단계로 돌아가 성취기준을 배정해주세요.</p>}
                            </div>
                        );
                    })}
                  </div>
            </div>
           )}
        </div>
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => goToStep(appState.currentStep - 1)}
            disabled={appState.currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-md text-gray-600 border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <ArrowLeftIcon className="w-5 h-5" /> 이전
          </button>
          <button 
            onClick={() => goToStep(appState.currentStep + 1)}
            disabled={appState.currentStep === 4}
            className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            다음 <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </main>
      <style>{`
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
