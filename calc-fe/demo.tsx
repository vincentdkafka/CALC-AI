// import { useEffect, useRef, useState } from "react";
// import { SWATCHES } from "@/constants";
// import { ColorSwatch, Group } from "@mantine/core";
// import { Button } from "@/components/ui/button";
// import axios from "axios";

// interface Response {
//     expr: string;
//     result: string;
//     assigned: boolean;
// }

// interface GeneratedResult {
//     expression: string;
//     answer: string;
// }

// export default function Home() {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [color, setColor] = useState('rgb(255, 255, 255)');
//     const [reset, setReset] = useState(false);
//     const [result, setResult] = useState<GeneratedResult>();
//     const [dictOfVars, setDictOfVars] = useState({});

//     // Reset canvas when reset is triggered
//     useEffect(() => {
//         if (reset) {
//             resetCanvas();
//             setReset(false);  // Reset the state after clearing the canvas
//         }
//     }, [reset]);

//     // Set up canvas size, drawing properties, and initial black background when component mounts
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (canvas) {
//             const ctx = canvas.getContext("2d");
//             if (ctx) {
//                 canvas.width = window.innerWidth;
//                 canvas.height = window.innerHeight - canvas.offsetTop;
//                 ctx.lineCap = "round";
//                 ctx.lineWidth = 3;
                
//                 // Set black background initially
//                 ctx.fillStyle = "black";
//                 ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill with black background
//             }
//         }
//     }, []);

//     const sendData = async () => {
//         const canvas = canvasRef.current;

//         if (canvas) {
//             const response = await axios({
//                 method: "POST",
//                 url: `${import.meta.env.VITE_API_URL}/calculate`,
//                 data: {
//                     image: canvas.toDataURL("image/png"),
//                     dict_of_vars: dictOfVars,
//                 },
//             });

//             const resp = await response.data;
//             console.log(`RESPONSE:`, resp);
//         }
//     };

//     const resetCanvas = () => {
//         const canvas = canvasRef.current;
//         if (canvas) {
//             const ctx = canvas.getContext("2d");
//             if (ctx) {
//                 ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//                 ctx.fillStyle = "black";
//                 ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill with black background
//             }
//         }
//     };

//     // Utility function to get mouse position relative to canvas
//     const getCanvasPos = (e: React.MouseEvent) => {
//         const canvas = canvasRef.current!;
//         const rect = canvas.getBoundingClientRect();
//         return {
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top,
//         };
//     };

//     const startDrawing = (e: React.MouseEvent) => {
//         const canvas = canvasRef.current;
//         if (canvas) {
//             const ctx = canvas.getContext("2d");
//             const { x, y } = getCanvasPos(e); // Get mouse position relative to canvas
//             if (ctx) {
//                 ctx.beginPath();
//                 ctx.moveTo(x, y);
//                 setIsDrawing(true);
//             }
//         }
//     };

//     const stopDrawing = () => {
//         setIsDrawing(false);
//     };

//     const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
//         if (!isDrawing) return;

//         const canvas = canvasRef.current;
//         if (canvas) {
//             const ctx = canvas.getContext("2d");
//             const { x, y } = getCanvasPos(e); // Get mouse position relative to canvas
//             if (ctx) {
//                 ctx.strokeStyle = color;
//                 ctx.lineTo(x, y); // Draw line based on the mouse position
//                 ctx.stroke();
//             }
//         }
//     };

//     return (
//         <>
//             <div className="grid grid-cols-3 gap-2">
//                 {/* RESET button now triggers canvas reset */}
//                 <Button
//                     onClick={() => setReset(true)} // Reset functionality fixed here
//                     className="z-20 bg-black text-white"
//                     variant="default"
//                     color="black"
//                 >
//                     RESET
//                 </Button>

//                 <Group className="z-20">
//                     {SWATCHES.map((swatchColor: string) => (
//                         <ColorSwatch
//                             key={swatchColor}
//                             color={swatchColor}
//                             onClick={() => setColor(swatchColor)} // Set color on click
//                         />
//                     ))}
//                 </Group>

//                 {/* CALCULATE button sends data */}
//                 <Button
//                     onClick={sendData} // Send data functionality
//                     className="z-20 bg-black text-white"
//                     variant="default"
//                     color="black"
//                 >
//                     CALCULATE
//                 </Button>
//             </div>
//             <canvas
//                 ref={canvasRef}
//                 id="canvas"
//                 className="absolute top-0 left-0 w-full h-full"
//                 onMouseDown={startDrawing}
//                 onMouseMove={draw}
//                 onMouseOut={stopDrawing}
//                 onMouseUp={stopDrawing}
//             />
//         </>
//     );
// }
