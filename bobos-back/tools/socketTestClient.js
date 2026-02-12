import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzcwNzQ5NTc3LCJleHAiOjE3NzEzNTQzNzd9.8XTwATPKnZ6Wgf0RjuM-cNO2-ynWp3GcTBHAE8wrlrU";

const socket = io("http://localhost:3001", {
    auth: { token },
});

socket.on("connect", () => console.log("✅ connected:", socket.id));
socket.on("connected", (data) => console.log("✅ server says:", data));

socket.on("orders:new", (order) => {
    console.log("🆕 NEW ORDER:", order);


});

socket.on("orders:update", (data) => console.log("ORDER UPDATE:", data));
socket.on("orders:error", (data) => console.log("⚠ORDER ERROR:", data));
socket.on("game:over", (data) => console.log("GAME OVER:", data));

socket.on("connect_error", (err) => {
    console.log("connect_error:", err.message);
});
