import requests
import json


# Define the URL of the API endpoint
api_url = "http://127.0.0.1:5000/predict"  # Replace with the actual URL if different

# Define a sample URL to test
email = "Conversation opened. 1 read message.\
Skip to content\
Using Gmail with screen readers\
4 of 713\
Vivek save CA$30—order again today. Just pay the fees!\
Inbox\
Uber <uber@uber.com> Unsubscribe\
Sat, Sep 23, 9:54 AM (14 hours ago)\
to me\
Uber\
Don\'t hit snooze on up to CA$30 off.\
You don\'t have long to save, so treat yourself today. Terms & fees apply. Add the promo code before you checkout to claim your meal on us:\
23eatsca099P\
Redeem now  \
Tasty treats from local restaurants\
4.6\
GC Burger\
Burgers • American\
Order now\
4.9\
IN A BOWL\
Healthy • Japanese\
Order now\
4.2\
Naija Jollof Parliament Street\
African • Comfort Food\
Order now\
4.8\
Kamen Ramen\
$ • Ramen • Japanese\
Order now\
Alt text\
Fresh ingredients. At your fingertips.\
Save time and make grocery shopping easier by getting your shopping list delivered.\
Shop now❯\
*Terms and conditions apply. Get CA$30 off your first order with Uber Eats by using promo code 23eatsca099P. Valid until Sept 28, 2023 12:00AM. Offer only applies when you spend CA$1 or more (excluding delivery and other fees). The user must apply the promo code in the app before completing their order. The offer may not be combined with other offers. Taxes and delivery fees still apply. Only valid where Uber Eats is available. See the app for details.\
Help Center\
Unsubscribe\
Terms\
Privacy\
Email Preferences\
This is a promotional email from Uber Rasier Canada Inc.\
121 Bloor Street East Suite #1600,\
Toronto, ON M4W 3M5\
Uber.com\
...\
[Message clipped]  View entire message\
"

# Create the data payload for the POST request
data_payload = json.dumps({"text": email})

# Make a POST request to the API endpoint
response = requests.post(api_url, data=data_payload, headers={'Content-Type': 'application/json'})

# Check the response status code and print the result
if response.status_code == 200:
    print("API Response:")
    print(json.loads(response.text))
else:
    print("Failed to get a valid response from the API. Status code:", response.status_code)
