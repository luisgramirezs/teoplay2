import ExampleCard from './ExampleCard';
import { normalizeEjemplos } from '../../utils/normalizeLesson';

type ExamplesBlockProps = {
    ejemplos?: unknown;
};

export default function ExamplesBlock({ ejemplos }: ExamplesBlockProps) {
    const ejemplosNormalizados = normalizeEjemplos(ejemplos);
    if (!ejemplosNormalizados.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <span className="text-lg">🤖</span>
                <p className="text-[12px] font-black text-[#5b40d6] uppercase tracking-wider">
                    Misión con TEOplay: ¡Hagámoslo juntos!
                </p>
            </div>

            <div className="space-y-6">
                {ejemplosNormalizados.map((ejemplo, index) => (
                    <ExampleCard key={index} ejemplo={ejemplo} index={index} />
                ))}
            </div>
        </div>
    );
}
