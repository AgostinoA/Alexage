module.exports = {
    // we now specify which attributes are saved (see the save interceptor below)
    PERSISTENT_ATTRIBUTES_NAMES: ['day', 'month', 'monthName', 'year', 'sonsNumber', 'sonsNames', 'emergencyContact', 'sessionCounter', 'reminderId', 'tmessage'],
    // these are the permissions needed to fetch the first name
    GIVEN_NAME_PERMISSION: ['alexa::profile:given_name:read'],
    // these are the permissions needed to send reminders
    REMINDERS_PERMISSION: ['alexa::alerts:reminders:skill:readwrite'],
    // these are the permissions needed to get address
    ADDRESS_PERMISSION: ['read::alexa:device:all:address'],
    // these are the permissions needed to get email and mobile number
    EMAIL_PERMISSION: ['alexa::profile:email:read'],
    NUMBER_PERMISSION: ['alexa::profile:mobile_number:read']
    // these are the permissions needed to send timers
    //TIMERS_PERMISSION: ['alexa::alerts:timers:skill:readwrite']
}