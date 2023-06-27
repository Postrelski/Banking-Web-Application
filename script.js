'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Matthew P',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  //username: 
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  // slice creates a copy, then we sort the copy
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i ) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__value">${mov}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
    // after begin - just inside the element, before its first child
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = `${acc.balance} USD`;
};

// this function will update the in, out, & interest text
const calcDisplaySummary = function(acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `$${incomes}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `$${Math.abs(out)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent =`$${interest}`;
}

// this function will add a 'username' attribute to each account object
const createUsernames =  function (acc) {
  acc.forEach(function(acc) {
    acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
  }) 
}
createUsernames(accounts);

const updateUI = function (acc) {
      //Display movements
      displayMovements(acc.movements);

      //Display balance
      calcDisplayBalance(acc);
  
      //Display summary
      calcDisplaySummary(acc);
}

// GLOBAL VARIABLES
let currentAccount, timer;

// --------------------
// FAKE LOGIN
// --------------------
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

const now = new Date();
const day = `${now.getDate()}`.padStart(2, 0);
const month =`${now.getMonth() + 1}`.padStart(2,0);
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();
labelDate.textContent = `${month}/${day}/${year}`;
// This will be the format = month/day/year

// EVENT HANDLERS
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  // will set currentAccount to an object in the array with matching username
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value);
    console.log(currentAccount);

  if(currentAccount?.pin === Number(inputLoginPin.value)) {

    //Display UI and Message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogoutTime();

    // Update UI
    updateUI(currentAccount);
  }
})

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find( acc => acc.username === inputTransferTo.value);
  inputTransferAmount.value = inputTransferTo.value = '';

  if (amount > 0 && 
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username) 
    { 
      // Doing the transfer
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

          // Update UI
      updateUI(currentAccount);

      // reset the timer
      clearInterval(timer);
      timer = startLogoutTime();
  } 
})

// loan method
// loan cannot be bigger than 10 % of largest deposit
btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if(amount > 0 && currentAccount.movements.some(
    mov => mov >= amount * 0.1)) {
      // add the movement

      currentAccount.movements.push(amount);

      // Update UI
      updateUI(currentAccount);

      // reset the timer
      clearInterval(timer);
      timer = startLogoutTime();
  }
  inputLoanAmount.value = '';
})

btnClose.addEventListener('click', function(e) {

  // prvents the page from refreshing each button click
  e.preventDefault();
  // checks if the user & pw we logged in with matches the account 
  // we are trying to delete!
  if (
    inputCloseUsername.value === currentAccount.username && 
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    // delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
  // make the text boxes empty
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});


// Method for website timer
const startLogoutTime = function () {

  // Call the timer every second
  const tick  = function() {

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In Each Call print the remaining time to UI
    labelTimer.textContent = min + ':' + sec;
  
    // When 0 seconds, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

      // Decrease 1s
      time --;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;

};


// LECTURE MATERIAL

// find method will return the first element that satifies the condition
// const first = array.find(mov => mov < 0);

// // maximum value
// // this will keep track of the highest value
// // reduce method is the most powerful array method
// const max = account1.movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, account1.movements[0])
// console.log(max);

// // each array method will send the input data somewhere
// // perform its operations and then spit the data back out
// const eurToUsd = 1.1;
// const totalDepositUSD = account1.movements
//   .filter(mov => mov > 0)
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalDepositUSD);


// // filter method that will return only what is above or below a certain value
// const deposits = account1.movements.filter(function (mov) {
//   return mov > 0;
// })
// const withdrawals = account1.movements.filter(function (mov) {
//   return mov < 0;
// })
// console.log(account1.movements);
// console.log(deposits);
// console.log(withdrawals);


// accumulator -> SNOWBAL
// reduce has a new parameter call accumulator
// this is used to find totals. 
// we just need to add accumulartor to the current to find max sums
// we can specify which number to start adding from. in this case we chose '0'
// const arrMov = [200, 450, -400, 3000, -650, -130, 70, 1300];
// console.log(arrMov);
// const balance = arrMov.reduce(function(acc, cur, i ,arr) {
//   console.log(`Iteration ${i}: ${acc}`);
//   return acc + cur;
// }, 0);
// console.log(balance);

// // Here is it with arrow function format. Just an easy way to find sums
// // here we are starting at '1', arbitrarily
// const balance2 = arrMov.reduce( (acc, curr) => acc + curr, 1)
// console.log(balance2);

////////////////////////////
// a lecture on maps
////////////////////////////

// map method returns a new array with modified results
// map method uses a function and return statement
// const movements = account1.movements;
// const eurToUsd = 1.1;

// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
// });
// console.log(movements);
// console.log(movementsUSD);

// // same thing but with arrow function
// // it still has a return statement...
// const movementsUSD_2 = movements.map(mov => mov * eurToUsd);
// console.log(movementsUSD_2);

// movements.map((mov, i, arr) => {
//   if(mov > 0) {

//     return `Movement ${i + 1}: You Desposited ${mov}`

//    } else {

//   }
// })
