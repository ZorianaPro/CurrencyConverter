const config = {
  api: {
    fixer: {
      key: '5f1d32b5c254fbfc2edcbca41ea8594d',
      url: 'http://data.fixer.io/api/convert'
    }
  }
};

const historyContainer = document.querySelector('.CurrencyConverter-History');
const cleanButton = document.querySelector('.CurrencyConverter-Clean');
const outputContainer = document.querySelector('input[name=output]');

const displayConversionHistory = () => {
  historyContainer.innerHTML = '';
  const conversionsHistory = JSON.parse(localStorage.getItem('conversionsHistory'));
  (conversionsHistory || []).map((conversion) => {
    const date = new Date(conversion.timeStamp);
    const newElement = document.createElement('div');
    newElement.className = 'CurrencyConverter-History-Row';
    newElement.innerHTML =
      `<div>${conversion.from} ${conversion.amount} = ${conversion.to} ${conversion.output}</div>
       <p class="Date">${date.getDate()}/${date.getMonth()}/${date.getFullYear()}</p>`;
    historyContainer.insertBefore(newElement, historyContainer.firstChild);
  });
  if (historyContainer.innerHTML !== '') {
    cleanButton.style.display = 'block';
  }
};

document.onreadystatechange = () => {
  if (document.readyState !== 'complete') {
    return;
  }
  if (localStorage.getItem('conversionsHistory')) {
    displayConversionHistory();
  } else {
    localStorage.setItem('conversionsHistory', JSON.stringify([]));
  }
};

const debounce = (fn, delay) => {
  let inDebounce = null;
  return args => {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => fn(args), delay);
  }
};

const cleanHistory = () => {
  localStorage.setItem('conversionsHistory', JSON.stringify([]));
  historyContainer.innerHTML = '';
  cleanButton.style.display = 'none';
};

const get = ({
  from,
  to,
  amount
}) =>
  axios.get(
    config.api.fixer.url,
    {
      params: {
        access_key: config.api.fixer.key,
        from: from,
        to: to,
        amount: amount
      }
    })
    .then((response) => {
      //display output to user
      outputContainer.value = response.data.result;
      //update localStorage
      updateLocalStorage({
        from: from,
        to: to,
        amount: amount,
        output: response.data.result
      });
    })
    .catch((error) =>  {
      console.log(error);
    });

const updateLocalStorage = ({
  from,
  to,
  amount,
  output
}) => {
  const currentState = JSON.parse(localStorage.getItem('conversionsHistory'));
  const timeStamp = new Date().getTime();
  currentState.push({
    from: from,
    to: to,
    amount: amount,
    output: output,
    timeStamp: timeStamp
  });
  localStorage.setItem('conversionsHistory', JSON.stringify(currentState));
  displayConversionHistory();
};

const onChange = debounce(() => {
  const submitButton = document.querySelector('button[type=submit]');
  submitButton && submitButton.click();
}, 250);

const onSubmit = () => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const amount = formData.get('amount');
  if (amount) {
    get({
      from: formData.get('fromCurrency'),
      to: formData.get('toCurrency'),
      amount: amount
    });
  } else {
    outputContainer.value = '';
  }

  return false;
};