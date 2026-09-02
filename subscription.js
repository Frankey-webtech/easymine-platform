document.addEventListener(
    "DOMContentLoaded",
    async () => {

const currentUser = Parse.User.current();

if (!currentUser) {
    window.location.href = "login.html";
}

const subscriptionState = {
    plans: {},
    currentPlan: "Free",
    currentPrice: 0,
    currentBilling: "",
    currentStatus: "",
    selectedPlan: null,
    selectedPrice: 0,
    selectedBilling: "",
    paymentMethod: "Card",
    autoRenew: false,
    currencyCode: "",
    currencySymbol: "",
    paymentReference: "",
    processing: false,
    billingCycle: "monthly"

};

const faqQuestions = document.querySelectorAll(

        ".faq-question"

    );
    
const monthlyBilling =
    document.getElementById("monthlyBilling");

const yearlyBilling =
    document.getElementById("yearlyBilling");

const subscriptionStatus =
    document.getElementById("subscriptionStatus");

const currentPlanName =
    document.getElementById("currentPlanName");

const currentPlanPrice =
    document.getElementById("currentPlanPrice");

const currentPlanBilling =
    document.getElementById("currentPlanBilling");

const maxInvoices =
    document.getElementById("maxInvoices");

const maxEstimates =
    document.getElementById("maxEstimates");

const maxClients =
    document.getElementById("maxClients");
    
const maxExports =
    document.getElementById("maxExports");

const freePlanCard =
    document.getElementById("freePlanCard");

const starterPlanCard =
    document.getElementById("starterPlanCard");

const businessPlanCard =
    document.getElementById("businessPlanCard");

const enterprisePlanCard =
    document.getElementById("enterprisePlanCard");

const freePlanButton =
    document.getElementById("freePlanButton");

const starterPlanButton =
    document.getElementById("starterPlanButton");

const businessPlanButton =
    document.getElementById("businessPlanButton");

const enterprisePlanButton =
    document.getElementById("enterprisePlanButton");

const freePlanPrice =
    document.getElementById("freePlanPrice");

const starterPlanPrice =
    document.getElementById("starterPlanPrice");

const businessPlanPrice =
    document.getElementById("businessPlanPrice");

const enterprisePlanPrice =
    document.getElementById("enterprisePlanPrice");

const cardPaymentMethod =
    document.getElementById("cardPaymentMethod");

const paypalPaymentMethod =
    document.getElementById("paypalPaymentMethod");

const cardRadio =
    document.getElementById("cardRadio");

const paypalRadio =
    document.getElementById("paypalRadio");

const saveCard =
    document.getElementById("saveCard");

const summaryPlanName =
    document.getElementById("summaryPlanName");

const summaryBillingCycle =
    document.getElementById("summaryBillingCycle");

const summaryPlanPrice =
    document.getElementById("summaryPlanPrice");

const summaryTotalPrice =
    document.getElementById("summaryTotalPrice");

const subscribeButton =
    document.getElementById("subscribeButton");
    
const freePlanName =
    freePlanCard.querySelector(".plan-name");

const starterPlanName =
    starterPlanCard.querySelector(".plan-name");

const businessPlanName =
    businessPlanCard.querySelector(".plan-name");

const enterprisePlanName =
    enterprisePlanCard.querySelector(".plan-name");

const freePlanDescription =
    freePlanCard.querySelector(".plan-description");

const starterPlanDescription =
    starterPlanCard.querySelector(".plan-description");

const businessPlanDescription =
    businessPlanCard.querySelector(".plan-description");

const enterprisePlanDescription =
    enterprisePlanCard.querySelector(".plan-description");

const freePlanIncludes =
    freePlanCard.querySelector(".plan-includes");

const starterPlanIncludes =
    starterPlanCard.querySelector(".plan-includes");

const businessPlanIncludes =
    businessPlanCard.querySelector(".plan-includes");

const enterprisePlanIncludes =
    enterprisePlanCard.querySelector(".plan-includes");

async function loadCurrentSubscription() {

    try {

        const response =
            await Parse.Cloud.run(
                "getCurrentSubscription"
            );

        if (!response.success) {

            throw new Error(
                "Unable to load subscription."
            );

        }

        subscriptionState.currentPlan =
            response.plan;

        subscriptionState.currentPrice =
            response.planPrice;

        subscriptionState.currentBilling =
            response.planBilling;

        subscriptionState.currentStatus =
            response.subscriptionStatus;

        subscriptionState.currencyCode =
    response.currency?.code || "";

subscriptionState.currencySymbol =
    response.currency?.symbol || "";
            
        subscriptionState.plans =
    response.plans || {};
    
updatePlanFeatures();

updatePlanCardDetails();

updatePlanFeatureLists();

updatePlanPrices();
    
    freePlanPrice.textContent =
    formatMoney(subscriptionState.plans.Free.price);

starterPlanPrice.textContent =
    formatMoney(subscriptionState.plans.Starter.price);

businessPlanPrice.textContent =
    formatMoney(subscriptionState.plans.Business.price);

enterprisePlanPrice.textContent =
    formatMoney(subscriptionState.plans.Enterprise.price);

        subscriptionState.selectedPlan =
            response.plan;

        subscriptionState.selectedPrice =
            response.planPrice;

        subscriptionState.selectedBilling =
            response.planBilling;
            
        updateSelectedPlanUI(
    response.plan
);

        subscriptionState.autoRenew =
            false;

        currentPlanName.textContent =
            response.plan;

        currentPlanPrice.textContent =
            formatMoney(response.planPrice);

        currentPlanBilling.textContent =
            response.planBilling;

        subscriptionStatus.textContent =
            response.subscriptionStatus;

        maxInvoices.textContent =
    response.usage.invoices.maximum === -1
        ? "Unlimited"
        : response.usage.invoices.maximum;

maxEstimates.textContent =
    response.usage.estimates.maximum === -1
        ? "Unlimited"
        : response.usage.estimates.maximum;

maxClients.textContent =
    response.usage.clients.maximum === -1
        ? "Unlimited"
        : response.usage.clients.maximum;
        
maxExports.textContent =
    response.usage.exports.maximum === -1
        ? "Unlimited"
        : response.usage.exports.maximum;

        summaryPlanName.textContent =
            response.plan;

        summaryBillingCycle.textContent =
            response.planBilling;

        summaryPlanPrice.textContent =
            formatMoney(response.planPrice);

        summaryTotalPrice.textContent =
            formatMoney(response.planPrice);

        saveCard.checked = false;

        updateCurrentPlanUI(
            response.plan
        );

    }

    catch (error) {

        console.error(error);

        showError(

            error.message ||

            "Unable to load subscription."

        );

    }

}

async function startCardSubscription() {

    const billing =
    subscriptionState.billingCycle === "monthly"
        ? "Monthly"
        : "Yearly";

const response =
    await Parse.Cloud.run(
        "initializeCardSubscription",
        {
            plan:
                subscriptionState.selectedPlan,

            billing,

            autoRenew:
                saveCard.checked
        }
    );

    if (!response.success) {

        throw new Error(

            response.message ||

            "Unable to initialize payment."

        );

    }

    subscriptionState.paymentReference =

        response.reference;

    window.location.href =

        response.authorizationUrl;

}

async function startPayPalSubscription() {

    const response =

        await Parse.Cloud.run(

            "initializePayPalSubscription",

            {

                plan:

                    subscriptionState.selectedPlan,

                autoRenew:

                    saveCard.checked

            }

        );

    if (!response.success) {

        throw new Error(

            response.message ||

            "Unable to initialize PayPal."

        );

    }

    subscriptionState.paymentReference =

        response.reference;

    window.location.href =

        response.authorizationUrl;

}

async function verifyPaystackPayment() {

    const params =

        new URLSearchParams(

            window.location.search

        );

    const reference =

        params.get("reference");

    if (!reference) {

        return;

    }

    try {

        setLoading(

            subscribeButton,

            true,

            "Verifying..."

        );

        const response =

            await Parse.Cloud.run(

                "verifyCardSubscription",

                {

                    reference

                }

            );

        if (!response.success) {

            throw new Error(

                response.message ||

                "Payment verification failed."

            );

        }

        showSuccess(

            "Subscription activated successfully."

        );

        await loadCurrentSubscription();

        window.history.replaceState(

            {},

            document.title,

            window.location.pathname

        );

    }

    catch (error) {

        console.error(error);

        showError(

            error.message ||

            "Unable to verify payment."

        );

    }

    finally {

        subscriptionState.processing = false;

        setLoading(

            subscribeButton,

            false

        );

    }

}

async function verifyPayPalPayment() {

    const params =

        new URLSearchParams(

            window.location.search

        );

    const orderId =

        params.get("token");

    const reference =

        params.get("reference");

    if (!orderId || !reference) {

        return;

    }

    try {

        setLoading(

            subscribeButton,

            true,

            "Verifying..."

        );

        const response =

            await Parse.Cloud.run(

                "verifyPayPalSubscription",

                {

                    orderId,

                    reference

                }

            );

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to verify PayPal payment."

            );

        }

        showSuccess(

            "Subscription activated successfully."

        );

        await loadCurrentSubscription();

        window.history.replaceState(

            {},

            document.title,

            window.location.pathname

        );

    }

    catch (error) {

        console.error(error);

        showError(

            error.message ||

            "Unable to verify PayPal payment."

        );

    }

    finally {

        subscriptionState.processing = false;

        setLoading(

            subscribeButton,

            false

        );

    }

}

function formatMoney(amount) {

    if (amount === -1) {
        return "Unlimited";
    }

    const currency =
        subscriptionState.currencySymbol || "";

    return (
        currency +
        Number(amount).toLocaleString()
    );

}

function updatePlanFeatures() {

    const plans =
        subscriptionState.plans || {};

    const formatLimit = (value, label) => {

        return value === -1
            ? "Unlimited " + label
            : value + " " + label;

    };

    if (plans.Free) {

        document.getElementById("freeMaxInvoices").textContent =
            formatLimit(plans.Free.maxInvoices, "Invoices");

        document.getElementById("freeMaxEstimates").textContent =
            formatLimit(plans.Free.maxEstimates, "Estimates");

        document.getElementById("freeMaxClients").textContent =
            formatLimit(plans.Free.maxClients, "Clients");

        document.getElementById("freeMaxExports").textContent =
            formatLimit(plans.Free.maxExports, "PDF Exports");

    }

    if (plans.Starter) {

        document.getElementById("starterMaxInvoices").textContent =
            formatLimit(plans.Starter.maxInvoices, "Invoices");

        document.getElementById("starterMaxEstimates").textContent =
            formatLimit(plans.Starter.maxEstimates, "Estimates");

        document.getElementById("starterMaxClients").textContent =
            formatLimit(plans.Starter.maxClients, "Clients");

        document.getElementById("starterMaxExports").textContent =
            formatLimit(plans.Starter.maxExports, "PDF Exports");

    }

    if (plans.Business) {

        document.getElementById("businessMaxInvoices").textContent =
            formatLimit(plans.Business.maxInvoices, "Invoices");

        document.getElementById("businessMaxEstimates").textContent =
            formatLimit(plans.Business.maxEstimates, "Estimates");

        document.getElementById("businessMaxClients").textContent =
            formatLimit(plans.Business.maxClients, "Clients");

        document.getElementById("businessMaxExports").textContent =
            formatLimit(plans.Business.maxExports, "PDF Exports");

    }

    if (plans.Enterprise) {

        document.getElementById("enterpriseMaxInvoices").textContent =
            formatLimit(plans.Enterprise.maxInvoices, "Invoices");

        document.getElementById("enterpriseMaxEstimates").textContent =
            formatLimit(plans.Enterprise.maxEstimates, "Estimates");

        document.getElementById("enterpriseMaxClients").textContent =
            formatLimit(plans.Enterprise.maxClients, "Clients");

        document.getElementById("enterpriseMaxExports").textContent =
            formatLimit(plans.Enterprise.maxExports, "PDF Exports");

    }

}

function setLoading(button, loading, text = "Processing...") {

    if (!button) return;

    if (loading) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent = text;

    } else {

        button.disabled = false;

        button.textContent =
            button.dataset.originalText || "Submit";

    }

}

function showError(message) {

    alert(message);

}

function showSuccess(message) {

    alert(message);

}

function updateCurrentPlanUI(currentPlan) {

    const cards = [

        freePlanCard,

        starterPlanCard,

        businessPlanCard,

        enterprisePlanCard

    ];

    const buttons = [

        freePlanButton,

        starterPlanButton,

        businessPlanButton,

        enterprisePlanButton

    ];

    cards.forEach(card => {

        card.classList.remove(
            "current-plan-card"
        );

    });

    buttons.forEach(button => {

        button.classList.remove(
            "current-button"
        );

        button.disabled = false;

        button.textContent =
            "Choose " +
            button.id
                .replace("PlanButton", "");

    });

    switch (currentPlan) {

        case "Free":

            freePlanCard.classList.add(
                "current-plan-card"
            );

            freePlanButton.classList.add(
                "current-button"
            );

            freePlanButton.textContent =
                "Current Plan";

            freePlanButton.disabled = true;

            break;

        case "Starter":

            starterPlanCard.classList.add(
                "current-plan-card"
            );

            starterPlanButton.classList.add(
                "current-button"
            );

            starterPlanButton.textContent =
                "Current Plan";

            starterPlanButton.disabled = true;

            break;

        case "Business":

            businessPlanCard.classList.add(
                "current-plan-card"
            );

            businessPlanButton.classList.add(
                "current-button"
            );

            businessPlanButton.textContent =
                "Current Plan";

            businessPlanButton.disabled = true;

            break;

        case "Enterprise":

            enterprisePlanCard.classList.add(
                "current-plan-card"
            );

            enterprisePlanButton.classList.add(
                "current-button"
            );

            enterprisePlanButton.textContent =
                "Current Plan";

            enterprisePlanButton.disabled = true;

            break;

    }

}

function getPlanDetails() {

    return subscriptionState.plans || {};

}

function selectPlan(planName) {

    if (planName === subscriptionState.currentPlan) {
        return;
    }

    const plan =
        getPlanDetails()[planName];

    if (!plan) {
        return;
    }

    subscriptionState.selectedPlan =
        planName;

    subscriptionState.selectedPrice =
        plan.price;

    subscriptionState.selectedBilling =
        plan.billing;

    summaryPlanName.textContent =
        planName;

    summaryBillingCycle.textContent =
        plan.billing;

    summaryPlanPrice.textContent =
        formatMoney(plan.price);

    summaryTotalPrice.textContent =
        formatMoney(plan.price);

    updateSelectedPlanUI(
        planName
    );

}

function selectPaymentMethod(method) {

    subscriptionState.paymentMethod = method;

    if (method === "Card") {

        cardRadio.checked = true;

        paypalRadio.checked = false;

        cardPaymentMethod.classList.add(
            "selected-payment-method"
        );

        paypalPaymentMethod.classList.remove(
            "selected-payment-method"
        );

    } else {

        paypalRadio.checked = true;

        cardRadio.checked = false;

        paypalPaymentMethod.classList.add(
            "selected-payment-method"
        );

        cardPaymentMethod.classList.remove(
            "selected-payment-method"
        );

    }

}

function updateSelectedPlanUI(selectedPlan) {

    const cards = {

        Free: freePlanCard,

        Starter: starterPlanCard,

        Business: businessPlanCard,

        Enterprise: enterprisePlanCard

    };

    Object.values(cards).forEach(card => {

        card.classList.remove(

            "selected-plan"

        );

    });

    if (cards[selectedPlan]) {

        cards[selectedPlan].classList.add(

            "selected-plan"

        );

    }

}

function updatePlanCardDetails() {

    const plans =
        subscriptionState.plans || {};

    const cardElements = {
        Free: {
            name: freePlanName,
            description: freePlanDescription,
            includes: freePlanIncludes
        },
        Starter: {
            name: starterPlanName,
            description: starterPlanDescription,
            includes: starterPlanIncludes
        },
        Business: {
            name: businessPlanName,
            description: businessPlanDescription,
            includes: businessPlanIncludes
        },
        Enterprise: {
            name: enterprisePlanName,
            description: enterprisePlanDescription,
            includes: enterprisePlanIncludes
        }
    };

    Object.entries(cardElements).forEach(
        ([planName, elements]) => {

            const plan =
                plans[planName];

            if (!plan) {
                return;
            }

            elements.name.textContent =
                plan.name;

            elements.description.textContent =
                plan.description;

            elements.includes.textContent =
                plan.includes;

        }
    );

}

function updatePlanFeatureLists() {

    const plans =
        subscriptionState.plans || {};

    const cards = {
        Free: freePlanCard,
        Starter: starterPlanCard,
        Business: businessPlanCard,
        Enterprise: enterprisePlanCard
    };

    Object.entries(cards).forEach(
        ([planName, card]) => {

            const plan =
                plans[planName];

            if (!plan || !Array.isArray(plan.features)) {
                return;
            }

            const featureList =
                card.querySelector(".plan-features");

            if (!featureList) {
                return;
            }

            featureList.innerHTML = "";

            plan.features.forEach(feature => {

                const li =
                    document.createElement("li");

                const icon =
                    document.createElement("i");

                const span =
                    document.createElement("span");

                icon.className =
                    "ri-checkbox-circle-fill";

                span.textContent =
                    feature;

                li.appendChild(icon);

                li.appendChild(span);

                featureList.appendChild(li);

            });

        }
    );

}

function selectBillingCycle(cycle) {

    subscriptionState.billingCycle = cycle;

    monthlyBilling.classList.toggle(
        "active",
        cycle === "monthly"
    );

    yearlyBilling.classList.toggle(
        "active",
        cycle === "yearly"
    );

    updatePlanPrices();

    if (subscriptionState.selectedPlan) {
        selectPlan(subscriptionState.selectedPlan);
    }

}

function updatePlanPrices() {

    const plans =
        subscriptionState.plans || {};

    const billing =
        subscriptionState.billingCycle;

    Object.entries(plans).forEach(
        ([planName, plan]) => {

            const card =
                document.querySelector(
                    `[data-plan="${planName}"]`
                );

            if (!card) {
                return;
            }

            const priceElement =
                card.querySelector(
                    "[data-plan-price]"
                );

            if (!priceElement) {
                return;
            }

            const price =
                billing === "yearly"
                    ? plan.yearlyPrice
                    : plan.monthlyPrice;

            priceElement.textContent =
                formatMoney(price);

        }
    );

}

monthlyBilling.addEventListener(
    "click",
    () => {
        selectBillingCycle("monthly");
    }
);

yearlyBilling.addEventListener(
    "click",
    () => {
        selectBillingCycle("yearly");
    }
);

starterPlanButton.addEventListener(

    "click",

    () => {

        selectPlan("Starter");

    }

);

businessPlanButton.addEventListener(

    "click",

    () => {

        selectPlan("Business");

    }

);

enterprisePlanButton.addEventListener(

    "click",

    () => {

        selectPlan("Enterprise");

    }

);

cardPaymentMethod.addEventListener(

    "click",

    () => {

        selectPaymentMethod("Card");

    }

);

paypalPaymentMethod.addEventListener(

    "click",

    () => {

        selectPaymentMethod("PayPal");

    }

);

cardRadio.addEventListener(

    "change",

    () => {

        selectPaymentMethod("Card");

    }

);

paypalRadio.addEventListener(

    "change",

    () => {

        selectPaymentMethod("PayPal");

    }

);

subscribeButton.addEventListener(

    "click",

    async () => {

        if (subscriptionState.processing) {

            return;

        }

        const selectedPlan =
    subscriptionState.plans[
        subscriptionState.selectedPlan
    ];

if (
    !subscriptionState.selectedPlan ||
    !selectedPlan ||
    subscriptionState.selectedPlan === "Free"
) {

    showError(
        "Please select a paid subscription plan."
    );

    return;

}

subscriptionState.selectedPrice =
    selectedPlan.price;


if (
    subscriptionState.paymentMethod !== "Card" &&
    subscriptionState.paymentMethod !== "PayPal"
) {

    showError(
        "Please select a payment method."
    );

    return;

}

subscriptionState.processing = true;

setLoading(
    subscribeButton,
    true,
    "Redirecting..."
);

try {

    if (
        subscriptionState.paymentMethod ===
        "Card"
    ) {

        await startCardSubscription();

    }

    else {

        await startPayPalSubscription();

    }
}

        catch (error) {

            console.error(error);

            showError(

                error.message ||

                "Unable to start subscription."

            );

            subscriptionState.processing = false;

            setLoading(

                subscribeButton,

                false

            );

        }

    }

);

faqQuestions.forEach(question => {

    question.addEventListener(

        "click",

        () => {

            const faqItem =

                question.closest(

                    ".faq-item"

                );

            const isOpen =

                faqItem.classList.contains(

                    "active"

                );

            document

                .querySelectorAll(

                    ".faq-item"

                )

                .forEach(item => {

                    item.classList.remove(

                        "active"

                    );

                });

            if (!isOpen) {

                faqItem.classList.add(

                    "active"

                );

            }

        }

    );

});

        await loadCurrentSubscription();

        selectPaymentMethod("Card");

        const params =
            new URLSearchParams(
                window.location.search
            );

        const orderId =
            params.get("token");

        const reference =
            params.get("reference");

        if (orderId && reference) {

            await verifyPayPalPayment();

        } else if (reference) {

            await verifyPaystackPayment();

        }

    }

);
