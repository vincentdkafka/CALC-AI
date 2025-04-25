import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import { data } from "react-router-dom";

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

interface ApiResponse {
    message: string;
    type: string;
    data: Response[];
}

interface RequestData {
    image: string;
    dict_of_vars: Record<string, string>;
}

interface LatexPosition {
    id: string;
    x: number;
    y: number;
}

function DraggableLatex({ latex, position }: { latex: string; position: LatexPosition }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: position.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        position: 'absolute' as const,
        left: position.x,
        top: position.y,
        zIndex: 10,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <div className="text-white latex-box">
                <div className="latex-content">{latex}</div>
            </div>
        </div>
    );
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [latexPositions, setLatexPositions] = useState<LatexPosition[]>([]);
    const [dictOfVars, setDictOfVars] = useState({});

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);  
        }
    }, [reset]);

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0); // Add delay if needed (0 is default to push it to the end of the queue)
        }
    }, [latexExpression]);
    
    useEffect(() => {
        if(result){
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
    
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
        script.async = true;
    
        script.onload = () => {
            try {
                if (window.MathJax && window.MathJax.Hub) {
                    window.MathJax.Hub.Config({
                        tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
                    });
    
                    // Optional: Run typesetting immediately after load
                    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
                } else {
                    console.error("MathJax.Hub is not available");
                }
            } catch (err) {
                console.error("MathJax load error:", err);
            }
        };
    
        document.body.appendChild(script);
    
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const renderLatexToCanvas = (expression: string, answer: string) => {
        const latex = `\\(LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        setLatexPositions(prev => 
            prev.map(pos => 
                pos.id === active.id 
                    ? { ...pos, x: pos.x + delta.x, y: pos.y + delta.y }
                    : pos
            )
        );
    };

    const sendData = async () => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            console.log('Sending data....', `${import.meta.env.VITE_API_URL}/calculate`);
            try {
                const response = await axios.post<ApiResponse>(`${import.meta.env.VITE_API_URL}/calculate`, {
                    image: canvas.toDataURL("image/png"),
                    dict_of_vars: dictOfVars,
                });
        
                const resp = response.data;
                console.log('Response from backend:', resp);

                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
                let minX = canvas.width;
                let minY = canvas.height;
                let maxX = 0; 
                let maxY = 0; 

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        if (imageData.data[(y * canvas.width + x) * 4 + 3] > 0) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                const CenterX = (minX + maxX) / 2;
                const CenterY = (minY + maxY) / 2;

                // Update results for each expression
                resp.data.forEach((data: Response, index: number) => {
                    // Show both assignment and calculation results
                    const latex = `\\(${data.expr} = ${data.result}\\)`;
                    setLatexExpression(prev => [...prev, latex]);
                    // Position each new result with an offset
                    setLatexPositions(prev => [...prev, {
                        id: `latex-${Date.now()}-${index}`,
                        x: CenterX,
                        y: CenterY + (index * 50) // Offset each result by 50 pixels
                    }]);

                    // Update variables if it's an assignment
                    if(data.assign === true){
                        setDictOfVars(prev => ({
                            ...prev,
                            [data.expr]: data.result,
                        }));
                    }
                });

                resetCanvas();
            } catch (error) {
                console.error('Error sending data:', error);
            }
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height); 
            }
        }
    };

    const getCanvasPos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            const { x, y } = getCanvasPos(e); 
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            const { x, y } = getCanvasPos(e); // Get mouse position relative to canvas
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(x, y); // Draw line based on the mouse position
                ctx.stroke();
            }
        }
    };

    return (
        <>
            <div className="grid grid-cols-3 gap-2">
                <Button
                    onClick={() => setReset(true)}
                    className="z-20 bg-black text-white"
                    variant="default"
                    color="black"
                >
                    RESET
                </Button>

                <Group className="z-20">
                    {SWATCHES.map((swatchColor: string) => (
                        <ColorSwatch
                            key={swatchColor}
                            color={swatchColor}
                            onClick={() => setColor(swatchColor)}
                        />
                    ))}
                </Group>

                <Button
                    onClick={sendData}
                    className="z-20 bg-black text-white"
                    variant="default"
                    color="black"
                >
                    CALCULATE
                </Button>
            </div>
            <canvas
                ref={canvasRef}
                id="canvas"
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
            />

            <DndContext onDragEnd={handleDragEnd}>
                {latexExpression.map((latex, index) => (
                    <DraggableLatex
                        key={latexPositions[index]?.id || index}
                        latex={latex}
                        position={latexPositions[index] || { id: `default-${index}`, x: 10, y: 200 }}
                    />
                ))}
            </DndContext>
        </>
    );
}
