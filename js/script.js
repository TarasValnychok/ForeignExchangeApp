const dateInput = document.getElementById("convertDate");

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
let todaysDate = document.getElementById("todaysDate");
let latestTable = document.getElementById("latestTable");
latestTable.style.textAlign = 'center';

const monthSelect = document.getElementById("monthSelect");

const baseCurrency = document.getElementById("baseCurrency");
const currencySelect = document.getElementById("currencySelect");

document.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = dateInput.max =  today;
    todaysDate.innerText = today;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    monthSelect.value =monthSelect.max= `${year}-${month}`;
    monthSelect.min = `${year-1}-${month}`
    getCurrencies()

});



async function getCurrencies(date) {
    const url = "https://api.fxratesapi.com/latest";

    try {
        const response = await axios.get(url);


        const rates = response.data.rates;
        

        fromCurrency.innerHTML = "";
        toCurrency.innerHTML = "";

        baseCurrency.innerHTML = "";
        currencySelect.innerHTML = "";
        latestTable.innerHTML = "";
        for (const currency in rates) {
            const option1 = document.createElement("option");
            option1.value = option1.text = currency;
            fromCurrency.add(option1);

            const option2 = document.createElement("option");
            option2.value = option2.text = currency;
            toCurrency.add(option2);

            const option3 = document.createElement("option");
            option3.value = option3.text = currency;
            baseCurrency.add(option3);

            const option4 = document.createElement("option");
            option4.value = option4.text = currency;
            currencySelect.add(option4);


           let tr = document.createElement("tr");
            let tdCurrencyName = document.createElement("td");
            let tdCurrencyRate = document.createElement("td");
            let pName = document.createElement("p");

            tdCurrencyName.style.display = "table-cell";
            tdCurrencyName.style.verticalAlign = "middle";
            tdCurrencyName.style.textAlign = "center";
            pName.style.margin = "0";


            pName.innerText = currency;
            tdCurrencyRate.innerText = rates[currency];

            tdCurrencyName.appendChild(pName);
            tr.appendChild(tdCurrencyName);
            tr.appendChild(tdCurrencyRate);

            latestTable.appendChild(tr);

        }

        fromCurrency.value = baseCurrency.value = "EUR";

        jQuery(document).ready(function ($) {
          if(!$("#latestTable").hasClass("paginated"))
          {
              $("#latestTable").paginathing({
              perPage: 5,
              containerClass: "panel-footer",
              liClass: 'page-item',
              linkClass: 'page-link',
              // activeClass: 'active',
              // disabledClass: 'disable',
              insertAfter: "#latestTable",
              limitPagination: 2
              });
              $("#latestTable").addClass("paginated");

          }
  });
    } catch (error) {
        alert(`Error fetching currency rates:${error}` );
    }
}



let converterBtn = document.getElementById("converterBtn")
converterBtn.addEventListener("click", async ()=> {

    const url = "https://api.fxratesapi.com/convert"
    try {
        const response = await axios.get(url, {
            params: {
                date: dateInput.value,
                from: fromCurrency.value,
                to: toCurrency.value
            }
        });
        let convertResult = document.getElementById("convertResult")
       
        convertResult.innerText = response.data.result;
        
    } catch (error) {
        alert(`Error fetching currency rates: ${error}` );
    }
    
})

function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month - 1, 1);
  const today = new Date();

  while (date.getMonth() === month - 1) {
    if (date <= new Date(today.getFullYear(), today.getMonth(), today.getDate()+1)) {
      const day = date.toISOString().split("T")[0];
      days.push(day);
    }
    date.setDate(date.getDate() + 1);
  }

  return days;
}



const ctx = document.getElementById('myChart').getContext('2d');

const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Exchange Rate',
      data: [],
      borderWidth: 1,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});


function updateDiagram(labelsData, valuesData) {
  myChart.data.labels = labelsData;
  myChart.data.datasets[0].data = valuesData;
  myChart.update();
}

const createDiagramBtn = document.getElementById("createDiagramBtn")
createDiagramBtn.addEventListener("click", async()=>{
  
  if (!currencySelect.value || !baseCurrency.value) {
        currencySelect.value = "EUR"
        baseCurrency.value = "EUR"
}
  const selectedMonthYear = monthSelect.value;
  const [year, month] = selectedMonthYear.split("-").map(Number);
  const days = getDaysInMonth(year, month);

  const url = `https://api.fxratesapi.com/timeseries?start_date=${days[0]}&end_date=${days[days.length-1]}&currencies=${currencySelect.value}&base=${baseCurrency.value}`;
  
  try{
    const response = await axios.get(url);
    const rates = response.data.rates;
    const normalizedRates = {};

  for (const fullDate in rates) {
      const dateKey = new Date(fullDate).toISOString().split("T")[0];
      normalizedRates[dateKey] = rates[fullDate];
  }
      const values = days.map(day => normalizedRates[day]?.[currencySelect.value] ?? null);
      
      updateDiagram(days, values);


        
  }
  catch(error){
    alert(`Error fetching currency rates: ${error}` );
  }

    

})

  

