const username = prompt("Enter new username: ");
const password = prompt("Enter new password: ");

if (username && password) {
  const passwordHash = await Bun.password.hash(password);
  
  const newUser = {
    id: 1,
    username: username,
    passwordHash: passwordHash
  };
  
  console.log("\ Готово! Скопируй этот массив и вставь его в свой users.json:\n");
  console.log(JSON.stringify([newUser], null, 2));
} else {
  console.log("Ошибка: логин и пароль обязательны.");
}