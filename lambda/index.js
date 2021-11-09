const Alexa = require('ask-sdk-core');
const util = require('./util'); // utility functions
const logic = require('./logic'); // this file encapsulates all "business" logic
const constants = require('./constants'); // constants such as specific service permissions go here

const languageStrings = require('./localisation');
const i18n = require('i18next');

const TIMERS_PERMISSION = ['alexa::alerts:timers:skill:readwrite'];
const TIMER_FUNCTION = getAnnouncementTimer;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const monthName = sessionAttributes['monthName'];
        const year = sessionAttributes['year'];
        const sonsNumber = sessionAttributes['sonsNumber'];
        const sonsNames = sessionAttributes['sonsNames'];
        const emergencyContact = sessionAttributes['emergencyContact'];
        const name = sessionAttributes['name'] || '';
        const sessionCounter = sessionAttributes['sessionCounter'];
        
        const dateAvailable = day && monthName && year;
        if (dateAvailable){
            // we can't use intent chaining because the target intent is not dialog based
            let speechText = !sessionCounter ? handlerInput.t('WELCOME_MSG', {name: name}) : handlerInput.t('WELCOME_BACK_MSG', {name: name});
            speechText += handlerInput.t('PRE_HELP_MSG');
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        } else {
            let speechText = !sessionCounter ? handlerInput.t('WELCOME_MSG', {name: name}) : handlerInput.t('WELCOME_BACK_MSG', {name: name});
            speechText += handlerInput.t('MISSING_MSG');
    
            // we use intent chaining to trigger the birthday registration multi-turn
            return handlerInput.responseBuilder
                .speak(speechText)
                // we use intent chaining to trigger the birthday registration multi-turn
                .addDelegateDirective({
                    name: 'RegisterBirthdayIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .getResponse();
        }
    }
};

const DementiaInfoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DementiaInfoIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        let speechText = '';
        if (intent.confirmationStatus === 'CONFIRMED') {
            speechText = handlerInput.t('DEMENTIA');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
            
        } else {
            speechText = handlerInput.t('Ok! ');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        }
        return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
    }
};

const RelaxIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RelaxIntent';
    },
    handle(handlerInput) {
        let speechText = '';
        speechText = handlerInput.t('RELAX');
        speechText += handlerInput.t('POST_SAY_HELP_MSG');
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const SupplyIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SupplyIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        let speechText = '';
        if (intent.confirmationStatus === 'CONFIRMED') {
            speechText = handlerInput.t('SUPPLY');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText = handlerInput.t('Ok! ');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        }
        return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
    }
};

const ActivityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ActivityIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        let speechText = '';
        if (intent.confirmationStatus === 'CONFIRMED') {
            speechText = handlerInput.t('ACTIVITY');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText = handlerInput.t('Ok! ');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        }
        return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
    }
};

const RegisterBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterBirthdayIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        let speechText = '';
        const sonsNumber = sessionAttributes['sonsNumber'];

        if (intent.confirmationStatus === 'CONFIRMED') {
            const day = Alexa.getSlotValue(requestEnvelope, 'day');
            const year = Alexa.getSlotValue(requestEnvelope, 'year');
            // we get the slot instead of the value directly as we also want to fetch the id
            const monthSlot = Alexa.getSlot(requestEnvelope, 'month');
            const monthName = monthSlot.value;
            const month = monthSlot.resolutions.resolutionsPerAuthority[0].values[0].value.id; //MM

            sessionAttributes['day'] = day;
            sessionAttributes['month'] = month; //MM
            sessionAttributes['monthName'] = monthName;
            sessionAttributes['year'] = year;
            //return SayBirthdayIntentHandler.handle(handlerInput);
            if (!sonsNumber){
                // we use intent chaining to trigger the birthday registration multi-turn
                return handlerInput.responseBuilder
                    // we use intent chaining to trigger the birthday registration multi-turn
                    .addDelegateDirective({
                        name: 'RegisterSonsNumberIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    })
                    .getResponse();
            } else {
                speechText = handlerInput.t('Ok! ');
                speechText = handlerInput.t('POST_SAY_HELP_MSG');
            }
        } else {
            speechText = handlerInput.t('REJECTED_MSG');
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        }
    }
};

const SayBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayBirthdayIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month']; //MM
        const year = sessionAttributes['year'];
        const name = sessionAttributes['name'] || '';
        let timezone = sessionAttributes['timezone'];

        let speechText = '';
        const dateAvailable = day && month && year;
        if (dateAvailable){
            if (!timezone){
                //timezone = 'Europe/Rome';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMEZONE_MSG'))
                    .getResponse();
            }
            const birthdayData = logic.getBirthdayData(day, month, year, timezone);
            sessionAttributes['age'] = birthdayData.age;
            sessionAttributes['daysLeft'] = birthdayData.daysUntilBirthday;
            speechText = handlerInput.t('BIRTHDATE');
            speechText += day +'.'+ month +'.'+ year +' . ';
            speechText += handlerInput.t('DAYS_LEFT_MSG', {name: name, count: birthdayData.daysUntilBirthday});
            speechText += handlerInput.t('WILL_TURN_MSG', {count: birthdayData.age + 1});
            const isBirthday = birthdayData.daysUntilBirthday === 0;
            if (isBirthday) { // it's the user's birthday!
                speechText = handlerInput.t('GREET_MSG', {name: name});
                speechText += handlerInput.t('NOW_TURN_MSG', {count: birthdayData.age});
            }
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RemindBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemindBirthdayIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month'];
        const year = sessionAttributes['year'];
        const name = sessionAttributes['name'] || '';
        let timezone = sessionAttributes['timezone'];
        const message = Alexa.getSlotValue(requestEnvelope, 'message');

        if (intent.confirmationStatus !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak(handlerInput.t('CANCEL_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        }

        let speechText = '';
        const dateAvailable = day && month && year;
        if (dateAvailable){
            if (!timezone){
                //timezone = 'Europe/Rome';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMEZONE_MSG'))
                    .getResponse();
            }

            const birthdayData = logic.getBirthdayData(day, month, year, timezone);

            // let's create a reminder via the Reminders API
            // don't forget to enable this permission in your skill configuration (Build tab -> Permissions)
            // or you'll get a SessionEnndedRequest with an ERROR of type INVALID_RESPONSE
            try {
                const {permissions} = requestEnvelope.context.System.user;
                if (!(permissions && permissions.consentToken))
                    throw { statusCode: 401, message: 'No permissions available' }; // there are zero permissions, no point in intializing the API
                const reminderServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                // reminders are retained for 3 days after they 'remind' the customer before being deleted
                const remindersList = await reminderServiceClient.getReminders();
                console.log('Current reminders: ' + JSON.stringify(remindersList));
                // delete previous reminder if present
                const previousReminder = sessionAttributes['reminderId'];
                if (previousReminder){
                    try {
                        if (remindersList.totalCount !== "0") {
                            await reminderServiceClient.deleteReminder(previousReminder);
                            delete sessionAttributes['reminderId'];
                            console.log('Deleted previous reminder token: ' + previousReminder);
                        }
                    } catch (error) {
                        // fail silently as this means the reminder does not exist or there was a problem with deletion
                        // either way, we can move on and create the new reminder
                        console.log('Failed to delete reminder: ' + previousReminder + ' via ' + JSON.stringify(error));
                    }
                }
                // create reminder structure
                const reminder = logic.createBirthdayReminder(
                    birthdayData.daysUntilBirthday,
                    timezone,
                    Alexa.getLocale(requestEnvelope),
                    message);
                const reminderResponse = await reminderServiceClient.createReminder(reminder); // the response will include an "alertToken" which you can use to refer to this reminder
                // save reminder id in session attributes
                sessionAttributes['reminderId'] = reminderResponse.alertToken;
                console.log('Reminder created with token: ' + reminderResponse.alertToken);
                speechText = handlerInput.t('REMINDER_CREATED_MSG', {name: name});
                speechText += handlerInput.t('PRE_HELP_MSG');
            } catch (error) {
                console.log(JSON.stringify(error));
                switch (error.statusCode) {
                    case 401: // the user has to enable the permissions for reminders, let's attach a permissions card to the response
                        handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.REMINDERS_PERMISSION);
                        speechText = handlerInput.t('MISSING_PERMISSION_MSG');
                        break;
                    case 403: // devices such as the simulator do not support reminder management
                        speechText = handlerInput.t('UNSUPPORTED_DEVICE_MSG');
                        break;
                    //case 405: METHOD_NOT_ALLOWED, please contact the Alexa team
                    default:
                        speechText = handlerInput.t('REMINDER_ERROR_MSG');
                }
                speechText += handlerInput.t('POST_SAY_HELP_MSG');
            }
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RegisterSonsNumberIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterSonsNumberIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        const sonsNames = sessionAttributes['sonsNames'];
        
        let speechText = '';
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            const sonsNumber = Alexa.getSlotValue(requestEnvelope, 'sonsNumber');
            sessionAttributes['sonsNumber'] = sonsNumber;
            //return SaySonsNamesIntentHandler.handle(handlerInput);
            if (!sonsNames){
                // we use intent chaining to trigger the birthday registration multi-turn
                return handlerInput.responseBuilder
                    // we use intent chaining to trigger the birthday registration multi-turn
                    .addDelegateDirective({
                        name: 'RegisterSonsNamesIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    })
                    .getResponse();
            } else {
                speechText = handlerInput.t('POST_SAY_HELP_MSG');
            }
        } else {
            speechText = handlerInput.t('CANCEL_MSG');
        }
        return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse(); 
    }
};

const SaySonsNumberIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaySonsNumberIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const sonsNumber = sessionAttributes['sonsNumber'];

        let speechText = '';
        if (sonsNumber){
            
            speechText = handlerInput.t('Hai ');
            speechText += sonsNumber +' figli . ';
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterSonsNumberIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RegisterSonsNamesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterSonsNamesIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        let speechText = '';
        const emergencyContact = sessionAttributes['emergencyContact'];
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            const sonsNames = Alexa.getSlotValue(requestEnvelope, 'sonsNames');
            sessionAttributes['sonsNames'] = sonsNames;
            //return SaySonsNamesIntentHandler.handle(handlerInput);
            if (!emergencyContact){
                // we use intent chaining to trigger the birthday registration multi-turn
                return handlerInput.responseBuilder
                    // we use intent chaining to trigger the birthday registration multi-turn
                    .addDelegateDirective({
                        name: 'RegisterEmergencyContactIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    })
                    .getResponse();
            } else {
                speechText = handlerInput.t('POST_SAY_HELP_MSG');
            }
        } else {
            speechText = handlerInput.t('CANCEL_MSG');
        }
        return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse(); 
    }
};

const SaySonsNamesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaySonsNamesIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const sonsNames = sessionAttributes['sonsNames'];

        let speechText = '';
        if (sonsNames){
            
            speechText = handlerInput.t('SONSNAMES');
            speechText += sonsNames +' . ';
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterSonsNamesIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RegisterEmergencyContactIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterEmergencyContactIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        let speechText = '';
        const {intent} = requestEnvelope.request;
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            const emergencyContact = Alexa.getSlotValue(requestEnvelope, 'emergencyContact');
            sessionAttributes['emergencyContact'] = emergencyContact;
            speechText = handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText = handlerInput.t('CANCEL_MSG')
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const SayEmergencyContactIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayEmergencyContactIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const emergencyContact = sessionAttributes['emergencyContact'];

        let speechText = '';
        if (emergencyContact){
            
            speechText = handlerInput.t('EMERGENCYCONTACT');
            speechText += emergencyContact +' . ';
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterEmergencyContactIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const AddressIntentHandler = {
   canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddressIntent';
  },
  async handle(handlerInput) {
      const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
      let speechText = '';
      try {
          const { deviceId } = requestEnvelope.context.System.device;
          const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
          const address = await deviceAddressServiceClient.getFullAddress(deviceId);
          if (address == undefined || (address.addressLine1 === null && address.stateOrRegion === null)) {
            speechText = handlerInput.t('NO_ADDRESS');
          } else {
            const completeAddress = `${address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
            speechText = handlerInput.t(`Questo è il tuo indirizzo completo, ${completeAddress}`) + (' . ');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
          }
        } catch (error) {
          console.log(JSON.stringify(error));
          if (error.statusCode == 403) {
              handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.ADDRESS_PERMISSION);
              speechText = handlerInput.t('MISSING_PERMISSION_MSG2');
          }
          console.log(JSON.stringify(error));
          speechText = handlerInput.t('ERROR_MSG');
    }
    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(handlerInput.t('REPROMPT_MSG'))
        .getResponse();
  },
};

const NumberIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NumberIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        let speechText = '';
        try {
            const client = serviceClientFactory.getUpsServiceClient();
            const number = await client.getProfileMobileNumber();
            if (number == null) {
                speechText = handlerInput.t('NO_NUMBER');
            } else {
                speechText = handlerInput.t(`Questo è il tuo numero di cellulare , ${number.countryCode}, ${number.phoneNumber}`) + (' . ');
                speechText += handlerInput.t('POST_SAY_HELP_MSG');
            }
        } catch (error) {
            console.log(JSON.stringify(error));
            if (error.statusCode === 403) {
                handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.NUMBER_PERMISSION);
                speechText = handlerInput.t('MISSING_PERMISSION_MSG3');
            }
            console.log(JSON.stringify(error));
            speechText = handlerInput.t('ERROR_MSG');
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const EmailIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EmailIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        let speechText = '';
        try {
            const client = serviceClientFactory.getUpsServiceClient();
            const email = await client.getProfileEmail();
            if (email == null) {
               speechText = handlerInput.t('NO_EMAIL');
            } else {
                speechText = handlerInput.t(`Questo è il tuo indirizzo email, ${email}`) + (' . ');
                speechText += handlerInput.t('POST_SAY_HELP_MSG');
            }
        } catch (error) {
            console.log(JSON.stringify(error));
            if (error.statusCode === 403) {
                handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.EMAIL_PERMISSION);
                speechText = handlerInput.t('MISSING_PERMISSION_MSG4');                
            }
            console.log(JSON.stringify(error));
            speechText = handlerInput.t('ERROR_MSG');
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    },
};

var c = 0;
const CONT_MSG = " Vuoi che ti ricordi altro? ";
const REM_OVER = " Sei pronto per andare! Buona giornata, arrivederci! ";

function shuffle(myarray) {
    let ctr = myarray.length;
    let temp;
    let index;
    while (ctr > 0) {
        index = Math.floor(Math.random() * ctr);
        ctr--;
        temp = myarray[ctr];
        myarray[ctr] = myarray[index];
        myarray[index] = temp;
    }
    return myarray;
}

var data = [
  'Prendi le chiavi di casa. ',
  'Accertati di aver spento tutte le luci. ',
  'Non dimenticare il tuo cellulare! ',
  'Ricorda di chiudere tutte le finestre e la porta quando esci. ',
  'Prendi l\'ombrello se sta piovendo o è nuvoloso. ',
  'Accertati di aver spento tutti gli elettrodomestici ed il gas. ',
  'L\'idratazione è importante, porta con te una bottiglietta d\'acqua. ',
];

data = shuffle(data);

const GoOutIntentHandler = {
    canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'&& request.intent.name === 'GoOutIntent') 
        || ((request.type === 'IntentRequest' && request.intent.name === 'ContinueIntent') && (handlerInput.requestEnvelope.request.intent.slots.responseYN.resolutions.resolutionsPerAuthority[0].values[0].value.id == 1));
    },
    handle(handlerInput) {

    const myAttributesManager = handlerInput.attributesManager;
    var mySessionAttributes = myAttributesManager.getSessionAttributes();
    console.log("c is: "+ c);
    if(mySessionAttributes.count == undefined){
        mySessionAttributes.count = 0;
    }
    console.log("sa count: "+ mySessionAttributes.count);
    c = mySessionAttributes.count;
    const responseBuilder = handlerInput.responseBuilder;
    console.log("prev value: " + c);
    mySessionAttributes.count += 1;
    myAttributesManager.setSessionAttributes(mySessionAttributes);
    
    if(c === (data.length) - 1){
      const randomReminder = data[c];
        const speechOutput = randomReminder + REM_OVER;
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
    }
    else{
      var speechOutput = "";
      const randomReminder = data[c];
      if(c === 0){
        speechOutput = "hey, ";
      }
      speechOutput += randomReminder + CONT_MSG ;
      const reprompt = CONT_MSG;
    
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
    }

  }
};

var activity = [
  'Potresti uscire per una passeggiata. è un\'occasione per stare all\'aria aperta, fare esercizio fisico e vedere paesaggi diversi. ',
  'Ti va di ballare? Provaci se ti piace la musica, è divertente! ',
  'Che ne dici di ascoltare un po di musica? Puoi anche cantare se ti và. ',
  'Leggere libri e giornali è molto stimolante per la mente. ',
  'Potresti guardare la televisione, magari un film, nuovo o vecchio che sia. ',
  'Se ne hai la possibilità, puoi guardare videocassette di avvenimenti familiari importanti. ',
  'Se c\'è qualcuno lì con te potreste fare giochi di società, o con le carte, assieme. ',
  'Guardare album di fotografie potrebbe farti sorridere. ',
  'Che ne dici di fare giardinaggio? Anche con piante da interni. ',
  'Potresti collezionare e mettere in ordine oggetti che ti stanno a cuore! ',
];

activity = shuffle(activity);

const ActivityAdviceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ActivityAdviceIntent';
    },
    handle(handlerInput) {

        const myAttributesManager = handlerInput.attributesManager;
        var mySessionAttributes = myAttributesManager.getSessionAttributes();
        console.log("c is: "+ c);
        if(mySessionAttributes.count == undefined){
            mySessionAttributes.count = 0;
        }
        console.log("sa count: "+ mySessionAttributes.count);
        c = mySessionAttributes.count;
        const responseBuilder = handlerInput.responseBuilder;
        console.log("prev value: " + c);
        mySessionAttributes.count += 1;
        myAttributesManager.setSessionAttributes(mySessionAttributes);
        let speechOutput = '';
        
        const randomReminder = activity[c];
        speechOutput = handlerInput.t(randomReminder);
        speechOutput += handlerInput.t('POST_SAY_HELP_MSG');
      
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

var firstGame = [
  ' topo . giallo . verde . ape . nero . tigre . viola . gatto . ',
  ' cane . orso . rana . grigio . ape . rosso . gallo . blu . ',
  ' sette . f . uno . h . m . nove . dieci . venti . ',
  ' oca . quattro . leone . tre . sette . scimmia . otto . daino . ',
  ' tv . penna . mano . tavolo . naso . coppa . occhi . busta . ',
  ' Roma . letto . tazza . Bari . tenda . Napoli . sedia . Firenze .  ',
  ' libro . penna . Venezia . carta . Genova . Trento . lettera . Foggia . ',
  ' verde . blu . raso . bianco . cotone . rosa . seta . arancio . ',
  ' Verona . due . Pisa . Cagliari . sei . dieci . Taranto . Brindisi . ',
  ' legno . Perugia . Lucca . acciaio . Ferrara . rame . Matera . vetro . ',
  ' pollo . acqua . birra . pasta . uovo . vino . pizza . latte . ',
  ' mare . riso . cielo . pesce . aria . carne . sole . frutta . ',
  ' arancia . torta . thè . pera . miele . caffè . pane . latte . ',
  ' fiori .  tenda . piante . divano . frutti . giardino . sedia . tavolo . ',
  ' tappo . limone . mela . nido . secchio . prugna . fune . uva . ',
];

firstGame = shuffle(firstGame);

const FirstGameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FirstGameIntent';
    },
    handle(handlerInput) {

        const myAttributesManager = handlerInput.attributesManager;
        var mySessionAttributes = myAttributesManager.getSessionAttributes();
        console.log("c is: "+ c);
        if(mySessionAttributes.count === undefined){
            mySessionAttributes.count = 0;
        }
        console.log("sa count: "+ mySessionAttributes.count);
        c = mySessionAttributes.count;
        const responseBuilder = handlerInput.responseBuilder;
        console.log("prev value: " + c);
        mySessionAttributes.count += 1;
        myAttributesManager.setSessionAttributes(mySessionAttributes);
        
        
        let speechText = '';
        const randomReminder = firstGame[c];
        mySessionAttributes ['randomReminder'] = randomReminder;
        speechText = handlerInput.t('FIRST_GAME');
        speechText += randomReminder + ' . ';
        myAttributesManager.setSessionAttributes(mySessionAttributes);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RepeatIntentHandler = { 
    canHandle (handlerInput) { 
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName (handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'; 
    },
    handle (handlerInput) { 
        //Get session attribute
        const mySessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
        const {randomReminder} = mySessionAttributes; 
        const speakOutput = randomReminder; 
        return handlerInput.responseBuilder 
            .speak(speakOutput) 
            .reprompt(speakOutput) 
            .getResponse(); 
  } 
};

const SecondGameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SecondGameIntent';
    },
    handle(handlerInput) {
        let speechText = '';
        speechText = handlerInput.t('SECOND_GAME');
        speechText += handlerInput.t('STORY1');
        speechText += handlerInput.t('STORY2');
        speechText += handlerInput.t('STORY3');
        speechText += handlerInput.t('SECOND_GAME_INSTR');
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective({
                name: 'FirstQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const FirstQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FirstQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('FIRST_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'SecondQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const SecondQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SecondQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('SECOND_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'ThirdQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const ThirdQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ThirdQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('THIRD_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'FourthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const FourthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FourthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('FOURTH_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'FifthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const FifthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FifthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        let speechText = '';
        speechText += handlerInput.t('FIFTH_ANSWER');
        speechText += handlerInput.t('SECOND_GAME_INSTR1');
        speechText += handlerInput.t('STORY4');
        speechText += handlerInput.t('STORY5');
        speechText += handlerInput.t('STORY6');
        speechText += handlerInput.t('SECOND_GAME_INSTR');
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective({
                name: 'SixthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const SixthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SixthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('SIXTH_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'SeventhQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const SeventhQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SeventhQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('SEVENTH_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'EighthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const EighthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EighthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        const speakOutput = handlerInput.t('EIGHTH_ANSWER');
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'NinthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const NinthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NinthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        const speakOutput = handlerInput.t('NINTH_ANSWER');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'TenthQuestionIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const TenthQuestionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TenthQuestionIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        let response = '';
        let speechText = '';
        response = Alexa.getSlotValue(requestEnvelope, 'response');
        speechText += handlerInput.t('TENTH_ANSWER');
        speechText += handlerInput.t('END_GAME');
        speechText += handlerInput.t('POST_SAY_HELP_MSG');
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};

function getAnnouncementTimer(handlerInput, duration, tmessage) {
    return {
        duration: duration,
        label: tmessage,
        creationBehavior: {
            displayExperience: {
                visibility: 'VISIBLE'
            }
        },
        triggeringBehavior: {
            operation: {
                type : 'ANNOUNCE',
                textToAnnounce: [{
                    locale: handlerInput.t('ANNOUNCEMENT_LOCALE_MSG'),
                    text: handlerInput.t('ANNOUNCEMENT_TEXT_MSG', {tmessage: tmessage})
                }]
            },
            notificationConfig: {
                playAudible: true
            }
        }
    };
}

const ReadTimerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReadTimerIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, serviceClientFactory} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        let timerId = sessionAttributes['lastTimerId'];

        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Read timers: ' + JSON.stringify(timersList));
            const totalCount = timersList.totalCount;
            const preText = totalCount ? handlerInput.t('TIMER_COUNT_MSG', {count: totalCount}) : '';
            if(timerId || totalCount > 0) {
                timerId = timerId ? timerId : timersList.timers[0].id; 
                let timerResponse = await timerServiceClient.getTimer(timerId);       
                console.log('Read timer: ' + JSON.stringify(timerResponse));
                const timerStatus = timerResponse.status;
                return handlerInput.responseBuilder
                    .speak(preText + handlerInput.t('LAST_TIMER_MSG', {status: handlerInput.t(timerStatus + '_TIMER_STATUS_MSG')}) + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(preText + handlerInput.t('NO_TIMER_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            }
        } catch (error) {
            console.log('Read timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('READ_TIMER_ERROR_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
        }
    }
}

const SetTimerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SetTimerIntent';
    },
    async handle(handlerInput) {
        const {requestEnvelope, attributesManager, serviceClientFactory} = handlerInput;
        const duration = Alexa.getSlotValue(requestEnvelope, 'duration');
        const tmessage = Alexa.getSlotValue(requestEnvelope, 'tmessage');


        const timer = TIMER_FUNCTION(handlerInput, duration, tmessage);
        console.log('About to create timer: ' + JSON.stringify(timer));
        
        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Current timers: ' + JSON.stringify(timersList));

            const timerResponse = await timerServiceClient.createTimer(timer);
            console.log('Timer creation response: ' + JSON.stringify(timerResponse));
            
            const timerId = timerResponse.id;
            const timerStatus = timerResponse.status;

            if(timerStatus === 'ON') {
                const sessionAttributes = attributesManager.getSessionAttributes();
                sessionAttributes['lastTimerId'] = timerId;
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('CREATE_TIMER_OK_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            } else
                throw { statusCode: 308, message: 'Timer did not start' };
                
        } catch (error) {
            console.log('Create timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                        .speak(handlerInput.t('CREATE_TIMER_ERROR_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                        .reprompt(handlerInput.t('REPROMPT_MSG'))
                        .getResponse();
        }
    }
};

const DeleteTimerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DeleteTimerIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, serviceClientFactory} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const timerId = sessionAttributes['lastTimerId'];

        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Read timers: ' + JSON.stringify(timersList));
            const totalCount = timersList.totalCount;
            if(totalCount === 0) {
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            }
            if(timerId) {
                await timerServiceClient.deleteTimer(timerId);
            } else {
                // warning, since there's no timer id we *cancel all 3P timers by the user*
                await timerServiceClient.deleteTimers();
            }
            console.log('Timer deleted!');
            return handlerInput.responseBuilder
                .speak(handlerInput.t('DELETE_TIMER_OK_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        } catch (error) {
            console.log('Delete timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('DELETE_TIMER_ERROR_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
        }
    }
}

const PauseTimerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PauseTimerIntent';
    },
    async handle(handlerInput) {
        const {serviceClientFactory} = handlerInput;
        
        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Read timers: ' + JSON.stringify(timersList));
            const totalCount = timersList.totalCount;

            if(totalCount === 0) {
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            }
            // pauses all timers
            for(const timer of timersList.timers ) {
                if(timer.status === 'ON'){
                    await timerServiceClient.pauseTimer(timer.id);
                }
            };
            return handlerInput.responseBuilder
                .speak(handlerInput.t('PAUSE_TIMER_OK_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        } catch (error) {
            console.log('Pause timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('PAUSE_TIMER_ERROR_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
        }
    }
}

const ResumeTimerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResumeTimerIntent';
    },
    async handle(handlerInput) {
        const {serviceClientFactory} = handlerInput;
        
        try {
            const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
            const timersList = await timerServiceClient.getTimers();
            console.log('Read timers: ' + JSON.stringify(timersList));
            const totalCount = timersList.totalCount;

            if(totalCount === 0) {
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMER_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            }
            // resumes all timers
            for(const timer of timersList.timers ) {
                if(timer.status === 'PAUSED'){
                    await timerServiceClient.resumeTimer(timer.id);
                }
            };
            return handlerInput.responseBuilder
                .speak(handlerInput.t('RESUME_TIMER_OK_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        } catch (error) {
            console.log('Resume timer error: ' + JSON.stringify(error));
            if(error.statusCode === 401) {
                console.log('Unauthorized!');
                // we send a request to enable by voice
                // note that you'll need another handler to process the result, see AskForResponseHandler
                return handlerInput.responseBuilder
                    .addDirective({
                    type: 'Connections.SendRequest',
                    'name': 'AskFor',
                    'payload': {
                        '@type': 'AskForPermissionsConsentRequest',
                        '@version': '1',
                        'permissionScope': TIMERS_PERMISSION
                    },
                    token: 'verifier'
                }).getResponse();
            }
            else
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('RESUME_TIMER_ERROR_MSG') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
        }
    }
}

var poem = [
  ' Bacio , di Pablo Neruda . La nebbia a gl\'irti colli. Piovigginando sale, E sotto il maestrale. Urla e biancheggia il mar. Ma per le vie del borgo, Dal ribollir de\' tini, Va l\'aspro odor de i vini, L\'anime a rallegrar. Gira su\' ceppi accesi, Lo spiedo scoppiettando. Sta il cacciator fischiando, Su l\'uscio a rimirar . Tra le rossastre nubi, Stormi d\'uccelli neri, Com\'esuli pensieri, Nel vespero migrar . ',
  ' Il calamaio , di Gianni Rodari . Che belle parole, se si potesse scrivere, con un raggio di sole. Che parole d’argento, se si potesse scrivere, con un filo di vento. Ma in fondo al calamaio, c’è un tesoro nascosto. e chi lo pesca, scriverà parole d’oro, col più nero inchiostro . ',
  ' Guarda là quella vezzosa ,  di Umberto Saba . Guarda là quella vezzosa, guarda là quella smorfiosa. Si restringe nelle spalle, tiene il viso nello scialle. O qual mai castigo ha avuto? Nulla . Un bacio ha ricevuto . ',
  ' Mattina , di Giuseppe Ungaretti . M\'illumino, d\'immenso . ',
  ' Capriccio , di Federico Lorca . Nella tela della luna, ragno del cielo. S\'impigliano le stelle, svolazzanti . ',
  ' Ho sceso dandoti il braccio , di Eugenio Montale . Ho sceso, dandoti il braccio, almeno un milione di scale. e ora che non ci sei, è il vuoto ad ogni gradino . Anche così è stato breve, il nostro lungo viaggio . Il mio dura tuttora, né più mi occorrono. le coincidenze, le prenotazioni, le trappole, gli scorni di chi crede. che la realtà sia quella che si vede . Ho sceso milioni di scale, dandoti il braccio, non già perché con quattr\'occhi forse si vede di più . Con te le ho scese, perché sapevo che di noi due. le sole vere pupille, sebbene tanto offuscate, erano le tue . ',
  ' Il passato , di Emily Dickinson . È una curiosa creatura il passato. Ed a guardarlo in viso. Si può approdare all\'estasi, O alla disperazione . Se qualcuno l\'incontra disarmato. Presto, gli grido, fuggi! Quelle sue munizioni arrugginite, Possono ancora uccidere! . ',
  ' Eterno , di Giuseppe Ungaretti . Tra un fiore colto e, l\'altro donato, l\'inesprimibile nulla . ',
  ' Se tardi a trovarmi , di Walt Whitman . Se tardi a trovarmi, insisti . Se non ci sono in nessun posto. cerca in un altro, perché io sono. seduto da qualche parte, ad aspettare te... e se non mi trovi più, in fondo ai tuoi occhi, allora vuol dire che sono dentro di te . ',
];

poem = shuffle(poem);

const PoemPlayerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PoemPlayerIntent';
    },
    handle(handlerInput) {
        const myAttributesManager = handlerInput.attributesManager;
        var mySessionAttributes = myAttributesManager.getSessionAttributes();
        console.log("c is: "+ c);
        if(mySessionAttributes.count == undefined){
            mySessionAttributes.count = 0;
        }
        console.log("sa count: "+ mySessionAttributes.count);
        c = mySessionAttributes.count;
        const responseBuilder = handlerInput.responseBuilder;
        console.log("prev value: " + c);
        mySessionAttributes.count += 1;
        myAttributesManager.setSessionAttributes(mySessionAttributes);
        let speechOutput = '';
        
        const randomReminder = poem[c];
        speechOutput = handlerInput.t(randomReminder);
        speechOutput += handlerInput.t('POST_SAY_HELP_MSG');
      
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    },
};

const PlaybackStoppedIntentHandler = { //intento aggiunto
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued' || 
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = { //intento aggiunto
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = { //intento aggiunto
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const AskForResponseHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
            && handlerInput.requestEnvelope.request.name === 'AskFor';
    },
    async handle(handlerInput) {
        console.log('Handler: AskForResponseHandler');
        const {request} = handlerInput.requestEnvelope;
        const {payload, status} = request;
        console.log('Connections reponse status + payload: ' + status + ' - ' + JSON.stringify(payload));

        if (status.code === '200') {
            if (payload.status === 'ACCEPTED') {
                // Request was accepted
                handlerInput.responseBuilder
                    .speak(handlerInput.t('VOICE_PERMISSION_ACCEPTED') + handlerInput.t('POST_SAY_HELP_MSG'))
                    .reprompt(handlerInput.t('REPROMPT_MSG'));
            } else if (payload.status === 'DENIED') {
                // Request was denied
                handlerInput.responseBuilder
                    .speak(handlerInput.t('VOICE_PERMISSION_DENIED') + handlerInput.t('GOODBYE_MSG'));
            } else if (payload.status === 'NOT_ANSWERED') {
                // Request was not answered
                handlerInput.responseBuilder
                    .speak(handlerInput.t('VOICE_PERMISSION_DENIED') + handlerInput.t('GOODBYE_MSG'));
            }
            if(payload.status !== 'ACCEPTED' && !payload.isCardThrown){
                handlerInput.responseBuilder
                        .speak(handlerInput.t('PERMISSIONS_CARD_MSG'))
                        .withAskForPermissionsConsentCard([TIMERS_PERMISSION]);
            }
            return handlerInput.responseBuilder.getResponse();
        }

        if (status.code === '400') {
            console.log('You forgot to specify the permission in the skill manifest!')
        }
        
        if (status.code === '500') {
            return handlerInput.responseBuilder
                .speak(handlerInput.t('VOICE_PERMISSION_ERROR') + handlerInput.t('POST_SAY_HELP_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        }
        // Something failed.
        console.log(`Connections.Response.AskFor indicated failure. error: ${request.status.message}`);

        return handlerInput.responseBuilder
            .speak(handlerInput.t('VOICE_PERMISSION_ERROR') + handlerInput.t('GOODBYE_MSG'))
            .getResponse();
    }
};

// This request interceptor will log all incoming requests to this lambda
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

// This request interceptor will bind a translation function 't' to the handlerInput
// Additionally it will handle picking a random value if instead of a string it receives an array
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        const localisationClient = i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings,
            returnObjects: true
        });
        localisationClient.localise = function localise() {
            const args = arguments;
            const value = i18n.t(...args);
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            }
            return value;
        };
        handlerInput.t = function translate(...args) {
            return localisationClient.localise(...args);
        }
    }
};

// This response interceptor will log all outgoing responses of this lambda
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

/* *
 * Below we use async and await ( more info: javascript.info/async-await )
 * It's a way to wrap promises and waait for the result of an external async operation
 * Like getting and saving the persistent attributes
 * */
const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        // the "loaded" check is because the "new" session flag is lost if there's a one shot utterance that hits an intent with auto-delegate
        if (Alexa.isNewSession(requestEnvelope) || !sessionAttributes['loaded']){ //is this a new session? not loaded from db?
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            console.log('Loading from persistent storage: ' + JSON.stringify(persistentAttributes));
            persistentAttributes['loaded'] = true;
            //copy persistent attribute to session attributes
            attributesManager.setSessionAttributes(persistentAttributes); // ALL persistent attributtes are now session attributes
        }
    }
};

// If you disable the skill and reenable it the userId might change and you loose the persistent attributes saved below as userId is the primary key
const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        if (!response) return; // avoid intercepting calls that have no outgoing response due to errors
        const {attributesManager, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession); //is this a session end?
        // the "loaded" check is because the session "new" flag is lost if there's a one shot utterance that hits an intent with auto-delegate
        const loadedThisSession = sessionAttributes['loaded'];
        if ((shouldEndSession || Alexa.getRequestType(requestEnvelope) === 'SessionEndedRequest') && loadedThisSession) { // skill was stopped or timed out
            // we increment a persistent session counter here
            sessionAttributes['sessionCounter'] = sessionAttributes['sessionCounter'] ? sessionAttributes['sessionCounter'] + 1 : 1;
            // limiting save of session attributes to the ones we want to make persistent
            for (var key in sessionAttributes) {
                if (!constants.PERSISTENT_ATTRIBUTES_NAMES.includes(key))
                    delete sessionAttributes[key];
            }
            console.log('Saving to persistent storage:' + JSON.stringify(sessionAttributes));
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
        }
    }
};

// If you disable the skill and reenable it the userId might change and the user will have to grant the permission to access the name again
const LoadNameRequestInterceptor = {
    async process(handlerInput) {
        const {attributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        if (!sessionAttributes['name']){
            // let's try to get the given name via the Customer Profile API
            // don't forget to enable this permission in your skill configuratiuon (Build tab -> Permissions)
            // or you'll get a SessionEndedRequest with an ERROR of type INVALID_RESPONSE
            // Per our policies you can't make personal data persistent so we limit "name" to session attributes
            try {
                const {permissions} = requestEnvelope.context.System.user;
                if (!(permissions && permissions.consentToken))
                    throw { statusCode: 401, message: 'No permissions available' }; // there are zero permissions, no point in intializing the API
                const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                const profileName = await upsServiceClient.getProfileGivenName();
                if (profileName) { // the user might not have set the name
                    //save to session attributes
                    sessionAttributes['name'] = profileName;
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                if (error.statusCode === 401 || error.statusCode === 403) {
                    // the user needs to enable the permissions for given name, let's append a permissions card to the response.
                    handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.GIVEN_NAME_PERMISSION);
                }
            }
        }
    }
};

const LoadTimezoneRequestInterceptor = {
    async process(handlerInput) {
        const {attributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const deviceId = Alexa.getDeviceId(requestEnvelope);

        if (!sessionAttributes['timezone']){
            // let's try to get the timezone via the UPS API
            // (no permissions required but it might not be set up)
            try {
                const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                const timezone = await upsServiceClient.getSystemTimeZone(deviceId);
                if (timezone) { // the user might not have set the timezone yet
                    console.log('Got timezone from device: ' + timezone);
                    //save to session and persisten attributes
                    sessionAttributes['timezone'] = timezone;
                }
            } catch (error) {
                console.log(JSON.stringify(error));
            }
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelpIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        let speechText = '';
        if (intent.confirmationStatus === 'CONFIRMED') {
            speechText = handlerInput.t('HELP_MSG2');
        } else {
            speechText = handlerInput.t('Ok! ');
            speechText += handlerInput.t('POST_SAY_HELP_MSG');
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
                || ((request.type === 'IntentRequest' && request.intent.name === 'ContinueIntent') && (handlerInput.requestEnvelope.request.intent.slots.responseYN.resolutions.resolutionsPerAuthority[0].values[0].value.id == 0));
    },
    
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const name = sessionAttributes['name'] || '';
        const speechText = handlerInput.t('GOODBYE_MSG', {name: name});

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speechText = handlerInput.t('REFLECTOR_MSG', {intent: intentName});

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speechText = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        DementiaInfoIntentHandler,
        RelaxIntentHandler,
        SupplyIntentHandler,
        ActivityIntentHandler,
        ActivityAdviceIntentHandler,
        RegisterBirthdayIntentHandler,
        SayBirthdayIntentHandler,
        RemindBirthdayIntentHandler,
        RegisterSonsNumberIntentHandler,
        SaySonsNumberIntentHandler,
        RegisterSonsNamesIntentHandler,
        SaySonsNamesIntentHandler,
        RegisterEmergencyContactIntentHandler,
        SayEmergencyContactIntentHandler,
        AddressIntentHandler,
        NumberIntentHandler,
        EmailIntentHandler,
        GoOutIntentHandler,
        FirstGameIntentHandler,
        RepeatIntentHandler,
        SecondGameIntentHandler,
        FirstQuestionIntentHandler,
        SecondQuestionIntentHandler,
        ThirdQuestionIntentHandler,
        FourthQuestionIntentHandler,
        FifthQuestionIntentHandler,
        SixthQuestionIntentHandler,
        SeventhQuestionIntentHandler,
        EighthQuestionIntentHandler,
        NinthQuestionIntentHandler,
        TenthQuestionIntentHandler,
        SetTimerIntentHandler,
        ReadTimerIntentHandler,
        DeleteTimerIntentHandler,
        PauseTimerIntentHandler,
        ResumeTimerIntentHandler,
        PoemPlayerIntentHandler,
        PlaybackStoppedIntentHandler,
        PlaybackStartedIntentHandler,
        ExceptionEncounteredRequestHandler,
        AskForResponseHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor,
        LoggingRequestInterceptor,
        LoadAttributesRequestInterceptor,
        LoadNameRequestInterceptor,
        LoadTimezoneRequestInterceptor)
    .addResponseInterceptors(
        LoggingResponseInterceptor,
        SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(util.getPersistenceAdapter())
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent('sample/memoria-amica')
    .lambda();