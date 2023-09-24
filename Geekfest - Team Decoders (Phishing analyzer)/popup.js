document.getElementById("analyzeBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];

    if (!tab) return;

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: function () {
          document.addEventListener("mouseover", function (event) {
            if (
              (event.target.tagName.toLowerCase() === "a" ||
                event.target.tagName.toLowerCase() === "button") &&
              !event.target.getAttribute("title")
            ) {
              event.target.setAttribute("title", "This is a link");
            }
          });

          let details = {
            sender: null,
            subject: null,
            bodyText: null,
            bodyHTML: null,
            linksCount: 0,
            linkDomains: [],
            keywords: [],
          };

          let senderElement = document.querySelector("[email]");
          if (senderElement) {
            details.sender = senderElement.getAttribute("email");
          }

          let subjectXPath =
            "/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div/div[2]/div/div[1]/div/div/div/table/tr/td/div[2]/div[1]/div[2]/div/div[1]/h2";
          let subjectNode = document.evaluate(
            subjectXPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          if (subjectNode) {
            details.subject = subjectNode.innerText.trim();
          }

          let bodyElement = document.querySelector('[role="listitem"]');
          if (bodyElement) {
            details.bodyText = bodyElement.innerText.trim();

            let links = bodyElement.querySelectorAll("a");
            details.linksCount = links.length;
            details.linkDomains = Array.from(links).map(
              (a) => new URL(a.href).hostname
            );

            let keywords = [
              "urgent",
              "password reset",
              "bank",
              "account",
              "verify",
              "login",
              "credentials",
              "click here",
            ];
            keywords.forEach((keyword) => {
              if (details.bodyText.toLowerCase().includes(keyword)) {
                details.keywords.push(keyword);
              }
            });
          }

          return details;
        },
      },
      function (results) {
        const emailDetails = results[0].result;

        chrome.storage.local.get(
          ["emailsScanned", "phishingDetected", "blacklist", "scannedSubjects"],
          function (oldData) {
            let emailsScanned = oldData.emailsScanned || 0;
            let phishingDetected = oldData.phishingDetected || 0;
            let blacklist = oldData.blacklist || [];
            let scannedSubjects = oldData.scannedSubjects || [];
            let isNewEmail = !scannedSubjects.includes(emailDetails.subject);

            if (isNewEmail) {
              scannedSubjects.push(emailDetails.subject);
              emailsScanned += 1;
            }

            fetch("http://127.0.0.1:5000/predict", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: emailDetails.bodyText,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.prediction == "1") {
                  if (isNewEmail) {
                    phishingDetected += 1;
                    if (!blacklist.includes(emailDetails.sender)) {
                      blacklist.push(emailDetails.sender);
                    }
                  }
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: function () {
                      alert("Caution: This email might be a phishing attempt!");
                    },
                  });
                } else {
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: function () {
                      alert(
                        "Safe: This email might not be a phishing attempt!"
                      );
                    },
                  });
                }

                chrome.storage.local.set(
                  {
                    emailsScanned: emailsScanned,
                    phishingDetected: phishingDetected,
                    blacklist: blacklist,
                    scannedSubjects: scannedSubjects,
                  },
                  function () {
                    updateUI();
                  }
                );
              })
              .catch((error) => {
                console.error("API call failed:", error);
              });
          }
        );
      }
    );
  });
});

function updateUI() {
  chrome.storage.local.get(
    ["emailsScanned", "phishingDetected"],
    function (data) {
      let emailsScanned = data.emailsScanned || 0;
      let phishingDetected = data.phishingDetected || 0;

      document.getElementById("emailsScanned").textContent = emailsScanned;
      document.getElementById("phishingDetected").textContent =
        phishingDetected;

      let vulnerability =
        emailsScanned === 0 ? 0 : (phishingDetected / emailsScanned) * 100;
      document.getElementById(
        "vulnerabilityProgress"
      ).style.width = `${vulnerability}%`;
      document.getElementById(
        "vulnerabilityProgress"
      ).textContent = `${Math.round(vulnerability)}%`;
    }
  );
}

updateUI();
