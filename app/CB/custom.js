// app/assets/javascripts/search.js
document.addEventListener("DOMContentLoaded", function() {
  
  const monthlyTag = document.querySelector(".monthly-report-tag");
  const yearlyTag = document.querySelector(".yearly-report-tag");
  const monthlySearch = document.querySelector(".monthly-search-fields");
  const yearlySearch = document.querySelector(".yearly-search-fields");
  const searchPopup = document.getElementById("search-popup");
  const searchResults = document.getElementById("search-results");
  const clientChangeAuthority = document.querySelector('.client-change-authority');
  const clientShareAuthority = document.querySelector('.client-share-authority');

  const editPopup = document.getElementById("edit-popup");
  const editContent = document.getElementById('edit-content');
  const closePopupButton = document.getElementById("close-popup");
  const activeClientName = document.getElementById("active-client-name");
  const editClientContainer = document.querySelector(".edit-client-container");
  const editClientName = document.getElementById("edit-client-name");
  const saveClientNameButton = document.getElementById("save-client-name");
  const cancelClientNameButton = document.getElementById("cancel-client-name");
  const editClientNameIcon = document.getElementById("edit-client-name-icon");
  const gsearch = document.getElementById("gsearch");
  const gsearch2 = document.getElementById("gsearch2");
  const annualReportRadio = document.getElementById("annual-report");
  const monthlyReportRadio = document.getElementById("monthly-report");
  const reportSelect = document.getElementById("report-select");
  const reportDate = document.getElementById("report-date");
  const reportYear = document.getElementById("report-year");
  const radioContainer = document.getElementById("radio-container");
  const dateTimeContainer = document.getElementById("date-time-container");
  const monthlyRadio = document.querySelector('input[name="report-type"][value="monthly"]');
  const yearlyRadio = document.querySelector('input[name="report-type"][value="yearly"]');
  const monthlyReportsContainer = document.querySelector('#monthlyReportsContainer');
  const yearlyReportsContainer = document.querySelector('#yearlyReportsContainer');
  
  const monthlyReportDetail = document.querySelector('.monthly-report-details');
  const yearlyReportDetail = document.querySelector('.yearly-report-details');
  const saveYearlyButton = document.querySelector('.save-yearly-report');  
  const reportIdData = document.querySelector('#report-id');
  const reportTypeData = document.querySelector('#report-type');
  const csvDiv = document.querySelector('#csv-div');
  const userIdDiv = document.querySelector('#user-id');
  const referenceIdDiv = document.querySelector('#reference-id');
  const exportCsvLink = document.querySelector('#export-csv-link');


  monthlyTag.addEventListener('click', () => {showFields('monthly')} );
  yearlyTag.addEventListener('click', () => {showFields('yearly')});
  showFields('monthly'); // Show monthly fields initially

  function showFields(type) {
    if (type === "monthly") {
      monthlyTag.classList.add('active');
      monthlySearch.classList.replace('d-none', 'd-flex');
      monthlyReportsContainer.textContent = '';
      yearlyTag.classList.remove('active');
      yearlySearch.classList.replace('d-flex', 'd-none');
      yearlyReportsContainer.textContent = '';
    } else {
      monthlyTag.classList.remove('active');
      monthlySearch.classList.replace('d-flex', 'd-none');
      monthlyReportsContainer.textContent = '';
      yearlyTag.classList.add('active');
      yearlySearch.classList.replace('d-none', 'd-flex');
      yearlyReportsContainer.textContent = '';
    }
  }

  const userId = userIdDiv.dataset.UserId;
  if (userId) {
    handleClientSearch(userId);
    document.querySelector('.label-username').classList.remove('d-none');
  }

  const searchForms = [
    { form: document.getElementById("searchForm"), input: gsearch },
    { form: document.getElementById("searchForm2"), input: gsearch2 }
  ];

  function handleSearch(query) {
    fetch(`/admin/users/search?query=${query}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(users => {
      searchResults.innerHTML = '';
      users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-result', 'rounded');
        userDiv.innerHTML = `<div>${user.name}</div><div>${user.email}</div>`;
        userDiv.addEventListener("click", () => {
          handleClientSearch(user.id);
          document.querySelector('.label-username').textContent = user.name;
          document.querySelector('.label-username').classList.remove('d-none');
        });
        searchResults.appendChild(userDiv);
      });
      searchPopup.style.display = "flex";
    });
  }

  function handleClientSearch(userId) {
    userIdDiv.dataset.UserId = userId;
    fetch(`/admin/clients/search?user_id=${userId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(clients => {
      searchPopup.style.display = "none";
      displayClients(clients);
    });
  }

  function appendClientOption(element, client) {
    let clientOption = document.createElement('option');
    clientOption.value = client.id;
    clientOption.textContent = shortString(client.name);
    element.appendChild(clientOption);
  }

  function displayClients(clients) {
    clientChangeAuthority.innerHTML = '';
    clientShareAuthority.innerHTML = '';
    clients.forEach(client => {
      appendClientOption(clientChangeAuthority, client);
      appendClientOption(clientShareAuthority, client);
    });
  }

  clientChangeAuthority.addEventListener('change', () => {
    setReferenceId(clientChangeAuthority.value, userIdDiv.dataset.UserId);
  });

  function setReferenceId(clientId, userId) {
    fetch(`/admin/reference_user_clients/search?user_id=${userId}&client_id=${clientId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(reference => {
      referenceIdDiv.dataset.ReferenceId = reference.id;
      currentAuthority.value = reference.role;
    });
  };

  function shortString(string) {
    let shortString = string.length > 20 ? string.substring(0, 20) + '...' : string;
    return shortString;
  }

  function toggleEditMode(enable) {
    if (enable) {
      editPopup.style.display = "flex";
    } else {
      editPopup.style.display = "none";
    }
  }
  cancelClientNameButton.addEventListener('click', () => {
    toggleEditMode(false);
  });

  editClientNameIcon.addEventListener('click', () => {
    toggleEditMode(true);
    editClientName.focus();
  });

  // Prevent closing the popup when clicking inside the content
  editContent.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  editPopup.addEventListener('click', () => {
    toggleEditMode(false);
  });

  saveClientNameButton.addEventListener('click', () => {
    const newName = editClientName.value.trim();
    const csrfToken = saveClientNameButton.dataset.csrfToken;

    if (newName && activeClientName.dataset.clientId) {
      fetch(`/admin/clients/${activeClientName.dataset.clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ client: { name: newName } })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          activeClientName.firstChild.textContent = shortString(data.client.name);
          const activeClientElement = document.querySelector(`[data-client-id="${activeClientName.dataset.clientId}"]`);
          activeClientElement.firstChild.textContent = data.client.name;
          toggleEditMode(false);
          alert('クライアントは正常に更新されました。');
        } else {
          alert('クライアントの更新中にエラーが発生しました: ' + data.errors.join(', '));
        }
      });
    }
  });

  searchForms.forEach(({ form, input }) => {
    form.addEventListener("click", function(event) {
      event.preventDefault();
      const query = input.value;
      gsearch.value = gsearch2.value = query
      handleSearch(query);
    });
  });

  closePopupButton.addEventListener("click", function() {
    searchPopup.style.display = "none";
  });

  function fetchReports(reportType, param_value = null) {
    let url = `/admin/clients/${currentClientId}/${reportType}_reports`;
    if (reportType == 'monthly') {
      url += `?date=${param_value}`;
    }
    if (reportType == 'yearly') {
      url += `?year=${param_value}`;
    }

    fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }

    })
    .then(response => response.json())
    .then(reports => {
      reportSelect.innerHTML = `<option selected disabled>報告を選択</option>`;
      let reportIds = [];
      reports.forEach(report => {
        const option = document.createElement('option');
        option.value = report.id;
        // Format the date based on reportType
        reportSelect.dataset.id << report.id;
        if (reportType === 'yearly') {
          const date = new Date(report.created_at);
          option.textContent = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
        } else if (reportType === 'monthly') {
          const time = new Date(report.created_at);
          option.textContent = time.toLocaleTimeString('ja-JP');
        } else {
          option.textContent = report.created_at; // Default behavior if neither yearly nor monthly
        }
        option.dataset.reportType = reportType;
        reportSelect.appendChild(option);
        reportSelect.dataset.reportType = reportType;
        reportIds.push(report.id);
      });
      reportSelect.dataset.reportIds = JSON.stringify(reportIds);
      exportCsvLink.href = `/admin/${reportSelect.dataset.reportType}_reports/export_csv.csv?report_ids=${reportSelect.dataset.reportIds}`;
    });
  }

  const searchMonthlyButton = document.querySelector('.search-monthly-button');
  const searchYearlyButton = document.querySelector('.search-yearly-button');
  const mStart = document.querySelector('.m-start-search');
  const mEnd = document.querySelector('.m-end-search');
  const yStart = document.querySelector('.y-start-search');
  const yEnd = document.querySelector('.y-end-search');  

  searchMonthlyButton.addEventListener('click', () => {fetchAllReports('monthly', mStart.value, mEnd.value, userIdDiv.dataset.UserId)});
  searchYearlyButton.addEventListener('click', () => {fetchAllReports('yearly', yStart.value, yEnd.value, userIdDiv.dataset.UserId)});

  function fetchAllReports(reportType, startTime = null, endTime = null, userId = null ) {
    let url = `/admin/${reportType}_reports/search`;
    const params = new URLSearchParams();

    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (userId) params.append('user_id', userId);
  
    fetch(`${url}?${params.toString()}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(reports => {
      displayAllReport(reports, reportType);
      console.log(reports);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
  }

  function displayAllReport(reports, reportType) {
    if (reportType === "monthly") {
      renderMonthlyReports(reports.data);
    } else {

    }
  }

  function showReportDisplay(reportType) {
    csvDiv.classList.remove('d-none');
    if (reportType === 'yearly') {
      yearlyReportDetail.style.display = 'block';
      monthlyReportDetail.style.display = 'none';
    } else if (reportType === 'monthly') {
      monthlyReportDetail.style.display = 'flex';
      yearlyReportDetail.style.display = 'none';
    }
  }

  function hideReportDisplay() {
    monthlyReportDetail.style.display = 'none';
    yearlyReportDetail.style.display = 'none';
  }

  function fetchReportDetails(reportType, reportId ) {
    fetch(`/admin/${reportType}_reports/${reportId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(report => {
      if (reportType === 'monthly') {
        populateFields(report);
        populateNotesFields(report.notes);
      } else if (reportType === 'yearly') {
        populateYearlyReportFields(report);
      }      
    })
    .catch(error => {
      alert('Error fetching report:', error);
    });
  }

  function getCurrentReportType() {
    if (monthlyRadio.checked) {
      return 'monthly';
    } else if (yearlyRadio.checked) {
      return 'yearly';
    }
  }

  function autoFetchReports() {
    let currentReportType = getCurrentReportType();
    if (currentReportType === 'monthly') {
      fetchReports('monthly', reportDate.value);
    } else if (currentReportType === 'yearly') {
      fetchReports('yearly', reportYear.value);
    }
  }

  // Event listener for report type radio buttons
  document.querySelectorAll('input[name="report-type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'yearly') {
        reportDate.style.display = 'none';
        reportYear.style.display = 'block';
        reportYear.classList.remove('d-none');
        fetchReports('yearly', reportYear.value);
      } else if (this.value === 'monthly') {
        reportDate.style.display = 'block';
        reportYear.style.display = 'none';
        fetchReports('monthly', reportDate.value);
      }
    });
  });

  // Event listener for date input
  reportDate.addEventListener('change', function() {
    fetchReports('monthly', this.value);
  });

  reportYear.addEventListener('change', function() {
    fetchReports('yearly', this.value);
  });

  // Event listener for report select
  reportSelect.addEventListener('change', function() {
    const reportId = this.value;
    const reportType = annualReportRadio.checked ? 'yearly' : 'monthly';
    showReportDisplay(reportType);
    fetchReportDetails(reportType, reportId);
    reportIdData.dataset.Id = this.value;
    reportTypeData.dataset.Type = reportType;
  });

  const fields = {
    type: 'select[name="type"]',
    'weather.weatherType': 'select[name="weather.weatherType"]',
    'weather.temperatureOutside': 'input[name="weather.temperatureOutside"]',
    'weather.humidityRoom': 'input[name="weather.humidityRoom"]',
    'weather.temperatureRoom': 'input[name="weather.temperatureRoom"]',
    referenceNumber: 'input[name="referenceNumber"]',
    'meterCurrent.allDayPower': 'input[name="meterCurrent.allDayPower"]',
    'meterCurrent.activePower': 'input[name="meterCurrent.activePower"]',
    'meterCurrent.reactivePower': 'input[name="meterCurrent.reactivePower"]',
    'meterCurrent.maximumPowerDemand': 'input[name="meterCurrent.maximumPowerDemand"]',
    'meterConfirmed.allDayPower': 'input[name="meterConfirmed.allDayPower"]',
    'meterConfirmed.activePower': 'input[name="meterConfirmed.activePower"]',
    'meterConfirmed.reactivePower': 'input[name="meterConfirmed.reactivePower"]',
    'meterConfirmed.maximumPowerDemand': 'input[name="meterConfirmed.maximumPowerDemand"]',
    'highVoltageBoard.voltage.RS': 'input[name="highVoltageBoard.voltage.RS"]',
    'highVoltageBoard.voltage.ST': 'input[name="highVoltageBoard.voltage.ST"]',
    'highVoltageBoard.voltage.TR': 'input[name="highVoltageBoard.voltage.TR"]',
    'highVoltageBoard.current.R': 'input[name="highVoltageBoard.current.R"]',
    'highVoltageBoard.current.S': 'input[name="highVoltageBoard.current.S"]',
    'highVoltageBoard.current.T': 'input[name="highVoltageBoard.current.T"]',
    'highVoltageBoard.power': 'input[name="highVoltageBoard.power"]',
    'highVoltageBoard.powerFactor': 'input[name="highVoltageBoard.powerFactor"]',
    'inspection.compartmentSwitch': 'select[name="inspectionPoints.compartmentSwitch"]',
    'inspection.highVoltageCabinet': 'select[name="inspectionPoints.highVoltageCabinet"]',
    'inspection.serviceLine': 'select[name="inspectionPoints.serviceLine"]',
    'inspection.cable': 'select[name="inspectionPoints.cable"]',
    'inspection.disconnector': 'select[name="inspectionPoints.disconnector"]',
    'inspection.electricFuse': 'select[name="inspectionPoints.electricFuse"]',
    'inspection.circuitBreaker': 'select[name="inspectionPoints.circuitBreaker"]',
    'inspection.highVoltageSwitch': 'select[name="inspectionPoints.highVoltageSwitch"]',
    'inspection.transformer': 'select[name="inspectionPoints.transformer"]',
    'inspection.electricCapacitor': 'select[name="inspectionPoints.electricCapacitor"]',
    'inspection.seriesReactor': 'select[name="inspectionPoints.seriesReactor"]',
    'inspection.lightningArrester': 'select[name="inspectionPoints.lightningArrester"]',
    'inspection.gaugeTransformer': 'select[name="inspectionPoints.gaugeTransformer"]',
    'inspection.busLine': 'select[name="inspectionPoints.busLine"]',
    'inspection.protectiveRelay': 'select[name="inspectionPoints.protectiveRelay"]',
    'inspection.switchBoard': 'select[name="inspectionPoints.switchBoard"]',
    'inspection.groundingWire': 'select[name="inspectionPoints.groundingWire"]',
    'inspection.powerReceivingRoom': 'select[name="inspectionPoints.powerReceivingRoom"]',
    'inspection.cubicle': 'select[name="inspectionPoints.cubicle"]',
    'inspection.powerDistributionFacility': 'select[name="inspectionPoints.powerDistributionFacility"]',
    'inspection.wiring': 'select[name="inspectionPoints.wiring"]',
    'inspection.lowVoltageEquipment': 'select[name="inspectionPoints.lowVoltageEquipment"]',
    'inspection.chargingDevice': 'select[name="inspectionPoints.chargingDevice"]',
    'inspection.battery': 'select[name="inspectionPoints.battery"]',
    'inspection.generator': 'select[name="inspectionPoints.generator"]',
    'inspection.starter': 'select[name="inspectionPoints.starter"]'
  };

  function populateNotesFields(notes, notesContainer) {
    notesContainer.innerHTML = ''; // Clear existing notes
  
    if (notes === null) { return };
    Object.keys(notes).forEach((key, index) => {
      const noteValue = notes[key];
  
      // Create a new note field
      const noteField = document.createElement('div');
      noteField.className = 'd-flex flex-column bd-highlight article-last pt-1 mx-1';
      noteField.innerHTML = `
        <div class="label-input-last flex-shrink-1 bd-highlight">記事${index + 1}</div>
        <div class="w-100 bd-highlight" style="min-width: "200px">
          <input type="text" id="${key}" name="${key}" size="5" value="${noteValue}" class="input-last" />
        </div>
      `;
  
      notesContainer.appendChild(noteField);
    });
  }

  function formatDateTime(datetimeStr) {
    const date = new Date(datetimeStr);

    // Extract date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Construct formatted date-time string
    return `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
  }

  // Function to populate fields based on report data
  function populateFields(report, reportElement) {
    reportIdData.dataset.Id = report.id;

    const clientName = reportElement.querySelector('.show-client-name');
    clientName.textContent = report.client_name;

    const machineContainer = reportElement.querySelector('#machineContainer');  // Container where machines will be appended
    const machineTemplate = reportElement.querySelector('#machineTemplate'); // Reference to the template
    updateStatusField(report);
    reportElement.querySelector('#exact-date-time').textContent = formatDateTime(report.created_at);

    // Clear existing machines
    while (machineContainer.firstChild) {
      machineContainer.removeChild(machineContainer.firstChild);
    }

    for (let i = 0; i < report.machineList.length; i++) {
      const newMachine = document.importNode(machineTemplate.content, true);
      updateMachineEntry(newMachine, i);
      machineContainer.appendChild(newMachine);

      const machinePrefix = `machineList.${i}`;
      fields[`${machinePrefix}.rs`] = `input[name="${machinePrefix}.rs"]`;
      fields[`${machinePrefix}.st`] = `input[name="${machinePrefix}.st"]`;
      fields[`${machinePrefix}.tr`] = `input[name="${machinePrefix}.tr"]`;
      fields[`${machinePrefix}.r`] = `input[name="${machinePrefix}.r"]`;
      fields[`${machinePrefix}.s`] = `input[name="${machinePrefix}.s"]`;
      fields[`${machinePrefix}.t`] = `input[name="${machinePrefix}.t"]`;
      fields[`${machinePrefix}.temperature`] = `input[name="${machinePrefix}.temperature"]`;
      fields[`${machinePrefix}.leakage`] = `input[name="${machinePrefix}.leakage"]`;
    }

    populateTimeFields(report, reportElement);

    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
          const value = getNestedProperty(report, key);
          const selector = fields[key];
          const element = reportElement.querySelector(selector);
          if (element) {
              if (element.tagName === 'SELECT') {
                  if (value !== undefined) {
                      const options = element.options;
                      for (let i = 0; i < options.length; i++) {
                          if (options[i].value == value) { // using == to compare number and string
                              element.selectedIndex = i;
                              break;
                          }
                      }
                  } else {
                      element.selectedIndex = -1; // Reset the select element
                  }
              } else {
                  element.value = value !== undefined ? value : ''; // Reset to empty string if value is undefined
              }
          }
      }
    }

    const notesContainer = reportElement.querySelector('#notes-container');
    populateNotesFields(report.notes, notesContainer)
  }

  function resetTimeFields(reportElement) {
    reportElement.querySelector('input[name="dateIn"]').value = '';
    reportElement.querySelector('input[name="timeIn"]').value = '';
    reportElement.querySelector('input[name="dateOut"]').value = '';
    reportElement.querySelector('input[name="timeOut"]').value = '';
  }

  function populateTimeFields(report, reportElement) {
    resetTimeFields(reportElement);
    if (report.dateTime) {
      const dateTimeIn = new Date(report.dateTime);
      if (!isNaN(dateTimeIn.getTime())) {        
        reportElement.querySelector('input[name="dateIn"]').value = dateTimeIn.toISOString().slice(0, 10); // YYYY-MM-DD
        reportElement.querySelector('input[name="timeIn"]').value = dateTimeIn.toISOString().slice(11, 16); // HH:MM
      }
    }
    
    if (report.dateTimeOut) {
      const dateTimeOut = new Date(report.dateTimeOut);
      if (!isNaN(dateTimeOut.getTime())) {      
        reportElement.querySelector('input[name="dateOut"]').value = dateTimeOut.toISOString().slice(0, 10); // YYYY-MM-DD
        reportElement.querySelector('input[name="timeOut"]').value = dateTimeOut.toISOString().slice(11, 16); // HH:MM
      }
    }
  }

  function updateMachineEntry(machine, index) {
    let machineTitle = machine.querySelector('.machine-title');
    machineTitle.textContent = `高圧盤${index+1}`;
    const inputs = machine.querySelectorAll('input');
    inputs.forEach(input => {
      const nameParts = input.name.split('.');
      nameParts[1] = index; // Update the index in the name
      input.name = nameParts.join('.');
      input.value = ''; // Clear the input value
    });
  }

  // Function to get nested property from object
  function getNestedProperty(obj, key) {
    const keyParts = key.split('.');
  
    return keyParts.reduce((o, p) => {
      // Check if p is a valid number
      const isArrayIndex = !isNaN(p);
      return o ? (isArrayIndex ? o[parseInt(p)] : o[p]) : undefined;
    }, obj);
  }

  function renderMonthlyReports(reports) {
    const reportsContainer = document.getElementById('monthlyReportsContainer');
    const reportTemplate = document.getElementById('monthlyReportTemplate');
  
    // Clear existing reports
    reportsContainer.innerHTML = '';
    console.log(reports);
    reports.forEach((report) => {
      const newReport = document.importNode(reportTemplate.content, true);
      const reportElement = newReport.querySelector('.monthly-report-details');
      reportElement.dataset.reportId = report.id; // Assign report ID
  
      // Populate the report fields
      populateFields(report, reportElement);
    
      // Add scroll horizontally
      reportElement.addEventListener('wheel', transformScroll);

      // Append the report element to the container
      reportsContainer.appendChild(newReport);

      // Add event submit edit
      const saveMonthlyButton = reportElement.querySelector('.save-monthly-report');  
      saveMonthlyButton.dataset.reportId = report.id;
      saveMonthlyButton.addEventListener('click', (e) => {
        submitForm(e.target.dataset.reportId);
      });
    });
  }

  function collectFormData(reportElement) {
    const formData = {};

    for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
            const selector = fields[key];
            const element = reportElement.querySelector(selector);
            if (element) {
                // Split the key by dot to handle nested structures
                const keys = key.split('.');
                let currentObj = formData;

                // Create nested objects if they don't exist
                for (let i = 0; i < keys.length - 1; i++) {
                    const nestedKey = keys[i];
                    currentObj[nestedKey] = currentObj[nestedKey] || {};
                    currentObj = currentObj[nestedKey];
                }

                // Assign the value to the deepest nested key
                const lastKey = keys[keys.length - 1];
                currentObj[lastKey] = element.tagName === 'SELECT' ? element.value : element.value.trim();
            }
        }
    }

    // Collect machine list data
    const machineList = [];
    const machines = reportElement.querySelectorAll('.machine-infor');
    machines.forEach((machine, index) => {
        const machineData = {
          rs: machine.querySelector(`input[name="machineList.${index}.rs"]`).value,
          st: machine.querySelector(`input[name="machineList.${index}.st"]`).value,
          tr: machine.querySelector(`input[name="machineList.${index}.tr"]`).value,
          r: machine.querySelector(`input[name="machineList.${index}.r"]`).value,
          s: machine.querySelector(`input[name="machineList.${index}.s"]`).value,
          t: machine.querySelector(`input[name="machineList.${index}.t"]`).value,
          leakage: machine.querySelector(`input[name="machineList.${index}.leakage"]`).value,
          temperature: machine.querySelector(`input[name="machineList.${index}.temperature"]`).value
        };
        machineList.push(machineData);
    });

    formData.machineList = machineList;

    //  Collect monthly notes
    const notes = {};

    const inputs = reportElement.querySelectorAll('.notes-container input[type="text"]');

    inputs.forEach(input => {
      const key = input.name;
      const value = input.value;
      notes[key] = value;
    });
    formData.notes = notes;

    return formData;
  }

  function submitForm(report_id) {
    const reportElement = document.querySelector(`.monthly-report-details[data-report-id="${report_id}"]`)
    const formData = collectFormData(reportElement);
    const saveMonthlyButton = reportElement.querySelector('.save-monthly-report');  
    const csrfTokenMonthly = saveMonthlyButton.dataset.csrfToken;

    const dateIn = reportElement.querySelector('input[name="dateIn"]').value;
    const timeIn = reportElement.querySelector('input[name="timeIn"]').value;
    const dateOut = reportElement.querySelector('input[name="dateOut"]').value;
    const timeOut = reportElement.querySelector('input[name="timeOut"]').value;

    const dateTimeIn = `${dateIn}T${timeIn}`;
    const dateTimeOut = `${dateOut}T${timeOut}`;

    formData.dateTime = dateTimeIn;
    formData.dateTimeOut = dateTimeOut;

    fetch(`/admin/monthly_reports/${report_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfTokenMonthly,
      },
      body: JSON.stringify({ monthly_report: formData }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      alert('レポートは正常に更新されました');
      // Handle success, e.g.,
    })
    .catch(error => {
      alert('レポートの更新中にエラーが発生しました:', error);
      // Handle errors
    });
  }

  // Function to populate the form fields with the data from the yearlyReport object
  function populateYearlyReportFields(yearlyReport) {
    // Clear existing sections
    document.getElementById('machine-tests-section').innerHTML = '';
    document.getElementById('ground-resistance-section').innerHTML = '';
    document.getElementById('low-voltage-circuit-options-section').innerHTML = '';
    document.getElementById('low-voltage-circuit-notes-section').innerHTML = '';
    document.getElementById('high-voltage-circuit-values-section').innerHTML = '';
    document.getElementById('GR-section').innerHTML = '';
    document.getElementById('OCR-section').innerHTML = '';
    document.getElementById('LGR-section').innerHTML = '';
    document.getElementById('yearly-report-year').value = '';

    document.getElementById('yearly-report-year').value = yearlyReport.year;
    const date = new Date(yearlyReport.year);
    document.getElementById('exact-date-time').textContent = date.getFullYear();
    updateStatusField(yearlyReport);

    // Function to populate a template
    function populateTemplate(templateId, data, containerId) {
      const template = document.getElementById(templateId).innerHTML;
      let populatedTemplate = template.replace(/{{index}}/g, data.index);
      populatedTemplate = populatedTemplate.replace(/{{indexTitle}}/g, data.index + 1);
      containerId.insertAdjacentHTML('beforeend', populatedTemplate);
    }

    // Populate Machine Tests
    yearlyReport.machineTests.forEach((test, index) => {
      populateTemplate('machine-test-template', { index: index }, document.getElementById('machine-tests-section'));
      document.querySelector(`[name="machineTests.${index}.note"]`).value = test.note;
      for (let i = 0; i < 4; i++) {
        document.querySelector(`[name="machineTests.${index}.shapes.${i}"]`).value = test.shapes[i];
      }
    });

    // Populate Ground Resistance
    yearlyReport.groundResistance.forEach((gr, index) => {
      populateTemplate('ground-resistance-template', { index: index }, document.getElementById('ground-resistance-section'));
      document.querySelector(`[name="groundResistance.${index}.measurement"]`).value = gr.measurement;
      document.querySelector(`[name="groundResistance.${index}.results"]`).value = gr.results;
    });

    // Populate high-voltage-circuit-values
    yearlyReport.highVoltageCircuitValues.forEach((data, index) => {
      populateTemplate('high-voltage-circuit-values-template', { index: index }, document.getElementById('high-voltage-circuit-values-section'));
      document.querySelector(`[name="highVoltageCircuitValues.${index}.measurement1"]`).value = data.measurement1;
      document.querySelector(`[name="highVoltageCircuitValues.${index}.measurement2"]`).value = data.measurement2;
      document.querySelector(`[name="highVoltageCircuitValues.${index}.ratio"]`).value = data.ratio;
      document.querySelector(`[name="highVoltageCircuitValues.${index}.results"]`).value = data.results;
      document.querySelector(`[name="highVoltageCircuitValues.${index}.measurement1"]`).value = data.measurement1;
    });

    // Populate lowVoltageCircuitOptions
    yearlyReport.lowVoltageCircuitOptions.forEach((data, index) => {
      populateTemplate('low-voltage-circuit-options-template', { index: index }, document.getElementById('low-voltage-circuit-options-section'));
      document.querySelector(`[name="lowVoltageCircuitOptions.${index}"]`).value = data;
    });

    yearlyReport.lowVoltageCircuitNotes.forEach((data, index) => {
      populateTemplate('low-voltage-circuit-notes-template', { index: index }, document.getElementById('low-voltage-circuit-notes-section'));
      document.querySelector(`[name="lowVoltageCircuitNotes.${index}"]`).value = data;
    });

    yearlyReport.GR.forEach((data, index) => {
      populateTemplate('GR-template', { index: index }, document.getElementById('GR-section'));
      document.querySelector(`[name="GR.${index}.minimumOperatingCurrent"]`).value = data.minimumOperatingCurrent;
      document.querySelector(`[name="GR.${index}.operatingTime"]`).value = data.operatingTime;
      document.querySelector(`[name="GR.${index}.minimumOperatingVoltage"]`).value = data.minimumOperatingVoltage;
      document.querySelector(`[name="GR.${index}.test"]`).value = data.test;
      document.querySelector(`[name="GR.${index}.phase"]`).value = data.phase;
      document.querySelector(`[name="GR.${index}.SOG"]`).value = data.SOG;
      document.querySelector(`[name="GR.${index}.inertia"]`).value = data.inertia;
      document.querySelector(`[name="GR.${index}.results"]`).value = data.results;
    });

    yearlyReport.OCR.forEach((data, index) => {
      populateTemplate('OCR-template', { index: index }, document.getElementById('OCR-section'));
      document.querySelector(`[name="OCR.${index}.results"]`).value = data.results;
      document.querySelector(`[name="OCR.${index}.timeLimitStart"]`).value = data.timeLimitStart;
      document.querySelector(`[name="OCR.${index}.timeLimit300Percent"]`).value = data.timeLimit300Percent;
      document.querySelector(`[name="OCR.${index}.timeLimitInterlock"]`).value = data.timeLimitInterlock;
      document.querySelector(`[name="OCR.${index}.instantStart"]`).value = data.instantStart;
      document.querySelector(`[name="OCR.${index}.instantOperationTime"]`).value = data.instantOperationTime;
    });

    yearlyReport.LGR.forEach((data, index) => {
      populateTemplate('LGR-template', { index: index }, document.getElementById('LGR-section'));
      document.querySelector(`[name="LGR.${index}.minimumOperatingCurrent"]`).value = data.minimumOperatingCurrent;
      document.querySelector(`[name="LGR.${index}.test"]`).value = data.test;
      document.querySelector(`[name="LGR.${index}.results"]`).value = data.results;
    });

  }

  function updateStatusField(data) {
    const statusField = document.querySelector('#status');
    let status = '未定'; // Default status: "Undetermined"
  
    if (data.isComplete) {
      status = '完了'; // "Complete"
    } else if (data.isChanged) {
      status = '変更あり'; // "Changed"
    } else if (data.deleted) {
      status = '削除済み'; // "Deleted"
      statusField.classList.add('bg--dark-red');
    } else if (data.isPendingComplete) {
      status = '完了保留中'; // "Pending Complete"
      statusField.classList.add('bg--dark-red');
    }

    statusField.textContent = status;
  }

  

  function collectYearlyData() {
    const yearlyData = {
      machineTests: [],
      groundResistance: [],
      highVoltageCircuitValues: [],
      lowVoltageCircuitOptions: [],
      lowVoltageCircuitNotes: [],
      GR: [],
      OCR: [],
      LGR: [],
      year: ""
    };
    yearlyData.year = document.querySelector(`[name="yearly-report-year"]`).value;

    function collectSectionData(prefix, hasIndex = true, transformFunc = null) {
      const elements = document.querySelectorAll(`[name^="${prefix}."]`);
      elements.forEach(element => {
        const parts = element.name.split('.');
        const index = parseInt(parts[1], 10);
        const property = parts.slice(2).join('.');
        const value = element.tagName === 'SELECT' ? element.value : element.value.trim();
  
        if (hasIndex) {
          if (!yearlyData[prefix][index]) {
            yearlyData[prefix][index] = {};
          }
          if (transformFunc) {
            transformFunc(yearlyData[prefix][index], property, value);
          } else {
            yearlyData[prefix][index][property] = value;
          }
        } else {
          yearlyData[prefix][index] = value;
        }
      });
    }
  
    function transformMachineTests(data, property, value) {
      const shapeIndexMatch = property.match(/^shapes\.(\d+)$/);
      if (shapeIndexMatch) {
        const shapeIndex = parseInt(shapeIndexMatch[1], 10);
        if (!data.shapes) {
          data.shapes = [];
        }
        data.shapes[shapeIndex] = value;
      } else {
        data[property] = value;
      }
    }
  
    collectSectionData('machineTests', true, transformMachineTests);
    collectSectionData('groundResistance');
    collectSectionData('highVoltageCircuitValues');
    collectSectionData('GR');
    collectSectionData('OCR');
    collectSectionData('LGR');
    collectSectionData('lowVoltageCircuitOptions', false);
    collectSectionData('lowVoltageCircuitNotes', false);

    return yearlyData;
  }

  function submitYearlyForm() {
    const formData = collectYearlyData();
    const csrfTokenYearly = saveYearlyButton.dataset.csrfToken;
    fetch(`/admin/${reportTypeData.dataset.Type}_reports/${reportIdData.dataset.Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfTokenYearly,
      },
      body: JSON.stringify({yearly_report: formData}),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      alert('レポートは正常に更新されました');
      // Handle success, e.g.,
    })
    .catch(error => {
      alert('レポートの更新中にエラーが発生しました:', error);
      // Handle errors
    });
  }

  saveYearlyButton.addEventListener('click', () => {
    submitYearlyForm();
  });
  
  // Share report functions
  
  const sharePopupBgXCover = document.querySelector('.share-popup-bg-cover');
  const shareReportButton = document.querySelector('.share-report-button');
  const sharePopup = document.getElementById('share-popup');
  const closeSharePopup = document.getElementById('close-share-popup');
  const changeShareButton = document.getElementById('change-share-button');
  const currentAuthority = document.getElementById('current-authority');
  const newAuthorityButton = document.getElementById('new-authority-button');
  const transmitShareButton = document.getElementById('transmit-share-button');
  const changeAuthorityWindow = document.getElementById('change-authority-window');
  const changeAuthorityForm = document.getElementById('change-authority-form');
  const transferAuthorityWindow = document.querySelector('.transfer-authority-window');
  const transferAuthorityForm = document.getElementById('transfer-authority-form');
  const alreadyHasAuthorityPopup = document.getElementById('already-has-authority-popup');
  const closeAlreadyHasAuthorityPopup = document.getElementById('close-popup-center');
  const removeAuthorityPopup = document.getElementById('remove-authority-popup');
  const cancelDeleteShare = document.getElementById('cancel-delete-share');
  const confirmDelete = document.getElementById('confirm-delete');

  // Show the pop up share popup
  shareReportButton.addEventListener('click', () => {
    sharePopup.classList.toggle('d-none');
    sharePopupBgXCover.classList.toggle('d-none');
  });
  closeSharePopup.addEventListener('click', () => {
    sharePopup.classList.add('d-none');
    sharePopupBgXCover.classList.add('d-none');
  });

  // Show and hide change authority window
  changeShareButton.addEventListener('click', () => {
    changeAuthorityWindow.classList.toggle('d-none');
    transferAuthorityWindow.classList.add('d-none');
  });

  // Show and hide transfer authority window
  transmitShareButton.addEventListener('click', () => {
    transferAuthorityWindow.classList.toggle('d-none');
    changeAuthorityWindow.classList.add('d-none');
  });

  // Close already has authority popup
  closeAlreadyHasAuthorityPopup.addEventListener('click', () => {
    alreadyHasAuthorityPopup.classList.add('d-none');
  });

  // Change authority submission
  changeAuthorityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(changeAuthorityForm);
    const role = formData.get('role');
    let method = 'PATCH';
    
    if (role === 'delete') { method = 'DELETE' }
    
    fetch('/admin/reference_user_clients/' + referenceIdDiv.dataset.ReferenceId, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ reference_user_client: {
        role: role
      }})
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        window.location.href = `/admin/manage_reports?user_id=${userIdDiv.dataset.UserId}`;
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('エラー:', error);
      alert('リクエストの処理中にエラーが発生しました。');
    });
  });

  // Handle form submission
  transferAuthorityForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(transferAuthorityForm);
    const userEmail = formData.get('user_email');
    const role = formData.get('role');

    // Example AJAX request to create the reference_user_client
    fetch('/admin/reference_user_clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ reference_user_client: {
        user_email: userEmail,
        role: role,
        client_id: activeClientName.dataset.clientId
      }})
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        if (data.error === 'すでに権限を持っている') {
          alreadyHasAuthorityPopup.classList.remove('d-none');
        } else {
          alert('エラーが発生しました: ' + data.error);
        }
      } else {
        alert(data.message);
        transferAuthorityWindow.classList.add('d-none');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  // Export csv file:
  const exportButton = document.getElementById('export-csv-button');

  exportButton.addEventListener('click', function() {
    if (reportSelect.dataset.reportIds.length === 0) {
      alert('The reports select tag is currently empty');
      return;
    }
    fetch(`/admin/${reportSelect.dataset.reportType}_reports/export_csv.csv?report_ids=${reportSelect.dataset.reportIds}`, {
      method: 'GET',
    })

  });

  function transformScroll(event) {
    if (!event.deltaY) {
      return;
    }

    event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
    event.preventDefault();
  }

  var elements = document.querySelectorAll('.scroll-container');
  elements.forEach(element => {
    element.addEventListener('wheel', transformScroll);
  });
});
