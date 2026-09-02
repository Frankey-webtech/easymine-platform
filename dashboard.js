let invoiceStatusChart = null;

let showClientImage = true;

let selectedInvoiceId = null;

let revenueChart = null;

const dashboardPage =
document.getElementById("dashboardContent");

const dashboardClientImageStyle = document.createElement("style");

const dashboardError =
document.getElementById("dashboardError");

const retryDashboardButton =
document.getElementById("retryDashboardButton");

const deleteModalOverlay =
document.getElementById(
    "deleteModalOverlay"
);

const profileImage =
document.getElementById("profileImage");

const cancelDeleteButton =
document.getElementById(
    "cancelDeleteButton"
);

const confirmDeleteButton =
document.getElementById(
    "confirmDeleteButton"
);

const toastContainer =
document.getElementById("toastContainer");

const searchInput =
document.getElementById("searchInput");

const notificationButton =
document.getElementById("notificationButton");

const notificationBadge =
document.getElementById("notificationBadge");

const helpButton =
document.getElementById("helpButton");

helpButton.addEventListener("click", () =>{

    window.location.href =
    "help.html";

});

const createInvoiceButton =
document.getElementById("createInvoiceButton");

createInvoiceButton.addEventListener("click", () =>{

    window.location.href =
    "invoice.html";

});

const profileMenuButton =
document.getElementById("profileMenuButton");

const profileDropdown =
document.getElementById(
    "profileDropdown"
);

profileMenuButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        profileDropdown.classList.toggle(
            "show"
        );

    }
);

document.addEventListener(
    "click",
    function () {

        profileDropdown.classList.remove(
            "show"
        );

    }
);

const viewAllInvoicesButton =
document.getElementById("viewAllInvoicesButton");

viewAllInvoicesButton.addEventListener("click", () =>{

    window.location.href =
    "invoice.html";

});

const viewAllEstimatesButton =
document.getElementById(
    "viewAllEstimatesButton"
);

const revenueFilter =
document.getElementById("revenueFilter");

if (revenueFilter) {

    revenueFilter.addEventListener("change", function(){

        loadRevenueOverview(this.value);

    });

}

function showToast(

    message,

    type = "info",

    duration = 3000

){

    const toast =
    document.createElement("div");

    toast.className =
    `toast ${type}`;

    toast.innerHTML = `

        <span>${message}</span>

        <span class="toastClose">&times;</span>

    `;

    toastContainer.appendChild(toast);

    const removeToast = () => {

        toast.style.animation =
        "toastOut .3s forwards";

        setTimeout(() => {

            toast.remove();

        },300);

    };

    toast
    .querySelector(".toastClose")
    .addEventListener(
        "click",
        removeToast
    );

    setTimeout(
        removeToast,
        duration
    );

}

function openDeleteModal(invoiceId){

    selectedInvoiceId = invoiceId;

    deleteModalOverlay.classList.add(
        "show"
    );

}

function closeDeleteModal(){

    selectedInvoiceId = null;

    deleteModalOverlay.classList.remove(
        "show"
    );

}

function showDashboardError(message) {

if (dashboardPage) {

    dashboardPage.style.display = "none";

}

if (dashboardError) {

    const errorTitle =
        document.getElementById(
            "dashboardErrorTitle"
        );

    const errorText =
        document.getElementById(
            "dashboardErrorMessage"
        );

    if (errorTitle) {

        errorTitle.textContent =
            "Unable to Load Dashboard";

    }

    if (errorText) {

        errorText.textContent =
            message ||
            "Something went wrong while loading your dashboard. Please check your internet connection and try again.";

    }

    dashboardError.style.display =
        "flex";

}

}

function hideDashboardError() {

if (dashboardError) {

    dashboardError.style.display = "none";

}

if (dashboardPage) {

    dashboardPage.style.display = "";

}

}

async function handleGoogleAuthentication() {

    const auth0Client =
        await auth0.createAuth0Client({

            domain:
                "dev-2tvu028qm4wmvd0l.us.auth0.com",

            clientId:
                "LpoyuFK4GqAA6gzsVzu2yxGarfb8mXs6",

            authorizationParams: {

                redirect_uri:
                    window.location.origin +
                    "/dashboard.html"

            }

        });

    const hasAuth0Callback =
        window.location.search.includes("code=") &&
        window.location.search.includes("state=");

    if (hasAuth0Callback) {

        const callbackResult =
            await auth0Client.handleRedirectCallback();

        const auth0User =
            await auth0Client.getUser();

        if (
            !auth0User ||
            !auth0User.email
        ) {

            throw new Error(
                "Unable to retrieve your Google account."
            );

        }

        const appState =
            callbackResult.appState || {};

        const country =
            appState.country;

        if (!country) {

            throw new Error(
                "Country information was not provided."
            );

        }

        const result =
            await Parse.Cloud.run(
                "createGoogleUser",
                {

                    email:
                        auth0User.email,

                    fullName:
                        auth0User.name || "",

                    country:
                        country

                }
            );

        if (
            !result ||
            !result.sessionToken
        ) {

            throw new Error(
                "Unable to complete Google authentication."
            );

        }

        const loggedInUser =
            await Parse.User.become(
                result.sessionToken
            );

        if (!loggedInUser) {

            throw new Error(
                "Google authentication succeeded, but the InvoicePro session could not be created."
            );

        }

        const currentUser =
            await Parse.User.currentAsync();

        if (!currentUser) {

            throw new Error(
                "Google authentication succeeded, but you are not logged in to InvoicePro."
            );

        }

        window.history.replaceState(
            {},
            document.title,
            "dashboard.html"
        );

    }

    const currentUser =
        await Parse.User.currentAsync();

    if (!currentUser) {

        window.location.href =
            "login.html";

        return false;

    }

    return true;

}

async function loadNotificationCount() {

    try {

        const result =
        await Parse.Cloud.run(
            "getNotificationCount"
        );

        if (result.unreadCount > 0) {

            notificationBadge.style.display =
                "flex";

            notificationBadge.textContent =
                result.unreadCount;

        }

        else {

            notificationBadge.style.display =
                "none";

        }

    }

    catch (error) {

    console.error(
        "Notification Error:",
        error
    );

    showDashboardError(
        error.message ||
        "Unable to load notifications."
    );

}

}

async function loadUserProfile() {

    try {

         const response = await Parse.Cloud.run(
            "getUserProfile"
        );

        const result = await Parse.Cloud.run("getDashboardProfile");



        document.getElementById("profileName").textContent =
            result.fullName || "User";

        document.getElementById("businessName").textContent =
            response.businessName || "Business Owner";

        const firstName = (result.fullName || "User").split(" ")[0];

        document.getElementById("welcomeHeading").textContent =
            `Welcome back, ${firstName} 👋`;

        const profileImage =
            document.getElementById("profileImage");

        if (result.profileImage) {

            profileImage.src = result.profileImage;

        } else {

            profileImage.src = "profile.png";

        }

    }

    catch (error) {

        console.error("Dashboard Profile Error:", error);

        showDashboardError(
            error.message ||
            "Unable to load your profile."
        );

    }

}

async function loadRecentEstimates() {

    try {

        const result =
        await Parse.Cloud.run(
            "getEstimates",
            {
                page: 1,

                limit: 5,

                search: "",

                status: "",

                sort: "newest"
            }
        );


        const tableBody =
            document.getElementById(
                "recentEstimatesBody"
            );


        tableBody.innerHTML = "";


        if (
            !result.estimates ||
            result.estimates.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            padding:30px;
                        "
                    >

                        No estimates found.

                    </td>

                </tr>

            `;

            return;

        }


        result.estimates.forEach(
            estimate => {

                let statusClass =
                    "pendingStatus";


                if (
                    estimate.status ===
                    "Approved"
                ) {

                    statusClass =
                        "paidStatus";

                }

                else if (
                    estimate.status ===
                    "Expired"
                ) {

                    statusClass =
                        "overdueStatus";

                }

                const estimateClientName =
                    estimate.clientName || "-";

                const estimateClientImage =
                    estimate.clientImageUrl || "";

                const estimateClientInitials =
                    estimateClientName
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(name => name.charAt(0).toUpperCase())
                        .join("") || "?";

const estimateClientDisplay =
    showClientImage
        ? (
            estimateClientImage
                ? `<img src="${estimateClientImage}" alt="${estimateClientName}" class="dashboardClientImage">`
                : `<span class="dashboardClientInitials">${estimateClientInitials}</span>`
        )
        : "";

                tableBody.innerHTML += `

                    <tr>

                        <td>
                            ${estimate.estimateNumber || "-"}
                        </td>


                        <td>
                            <div class="dashboardClientCell">
                                ${estimateClientDisplay}
                                <span>${estimateClientName}</span>
                            </div>
                        </td>


                        <td>
                           ${Number(
    estimate.grandTotal || 0
).toLocaleString(
    undefined,
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
)}
                        </td>


                        <td>

                            <span
                                class="statusBadge ${statusClass}"
                            >

                                ${estimate.status || "Draft"}

                            </span>

                        </td>


                      <td>
    ${estimate.createdDate
        ? new Date(
            estimate.createdDate
        ).toLocaleDateString()
        : "-"
    }
</td>


                        <td class="estimateActions">

                          <button
    class="tableActionButton dashboardEstimateView"
    data-id="${estimate.objectId}"
>
    <i class="ri-eye-line"></i>
</button>

<button
    class="tableActionButton dashboardEstimateEdit"
    data-id="${estimate.objectId}"
>
    <i class="ri-edit-line"></i>
</button>

<button
    class="tableActionButton dashboardEstimateDuplicate"
    data-id="${estimate.objectId}"
>
    <i class="ri-stack-line"></i>
</button>

<button
    class="tableActionButton dashboardEstimateDelete"
    data-id="${estimate.objectId}"
>
    <i class="ri-delete-bin-line"></i>
</button>

<button
    class="tableActionButton dashboardEstimateConvert"
    data-id="${estimate.objectId}"
>
    <i class="ri-file-add-line"></i>
</button>
                        </td>

                    </tr>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Recent Estimates Error:",
            error
        );

        showDashboardError(
            error.message ||
            "Unable to load recent estimates."
        );

    }

}

async function loadDashboard() {

    hideDashboardError();
    
    await loadBusinessProfileSettings();

    await Promise.allSettled([

        loadUserProfile(),

        loadDashboardStatistics(),

        loadRevenueOverview(),

        loadInvoiceStatus(),

        loadRecentInvoices(),

        loadRecentEstimates(),

        loadUpcomingReminders(),

        loadNotificationCount()

    ]);

}

async function loadDashboardStatistics() {

    try {

        const result = await Parse.Cloud.run(
            "getDashboardStatistics"
        );



        const growth =
await Parse.Cloud.run(
    "getInvoiceStatistics"
);

        document.getElementById(
            "totalRevenueValue"
        ).textContent =
            result.currencySymbol +
            Number(result.totalRevenue).toLocaleString();

        document.getElementById(
            "paidInvoicesValue"
        ).textContent =
            result.paidInvoices;

        document.getElementById(
            "pendingInvoicesValue"
        ).textContent =
            result.pendingInvoices;

        document.getElementById(
            "clientsValue"
        ).textContent =
            result.clientCount;

            document.getElementById(
    "totalRevenueGrowth"
).textContent =
    growth.totalGrowth;

document.getElementById(
    "paidInvoicesGrowth"
).textContent =
    growth.paidGrowth;

document.getElementById(
    "pendingInvoicesGrowth"
).textContent =
    growth.pendingGrowth;

    document.getElementById(
    "clientsGrowth"
).textContent =
    growth.clientsGrowth;

    }

    catch (error) {

    console.error(
        "Dashboard Statistics Error:",
        error
    );

    showDashboardError(
        error.message ||
        "Unable to load dashboard statistics."
    );

}

}

async function loadRevenueOverview(period = "6months") {

    try {

        const result = await Parse.Cloud.run(
            "getRevenueOverview",
            {
                period: period
            }
        );

        const ctx =
            document.getElementById("revenueChart");

        if (revenueChart) {

            revenueChart.destroy();

        }

        revenueChart = new Chart(ctx, {

            type: "line",

            data: {

                labels: result.labels,

                datasets: [{

                    label: "Revenue",

                    data: result.values,

                    borderColor: "#2563EB",

                    backgroundColor:
                        "rgba(37,99,235,0.15)",

                    fill: true,

                    tension: 0.35,

                    borderWidth: 3,

                    pointRadius: 4,

                    pointHoverRadius: 6

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        });

    }

    catch (error) {

    console.error(
        "Revenue Overview Error:",
        error
    );

    showDashboardError(
        error.message ||
        "Unable to load revenue overview."
    );

}

}

async function loadInvoiceStatus() {

    try {

        const result = await Parse.Cloud.run(
            "getInvoiceStatus"
        );
        console.log("INVOICE STATUS RESULT:", result);



        document.getElementById(
            "paidPercentage"
        ).textContent =
            result.paidPercentage + "%";

        document.getElementById(
            "pendingPercentage"
        ).textContent =
            result.pendingPercentage + "%";

        document.getElementById(
            "overduePercentage"
        ).textContent =
            result.overduePercentage + "%";

        const ctx = document
            .getElementById("invoiceStatusChart")
            .getContext("2d");

        if (invoiceStatusChart) {

            invoiceStatusChart.destroy();

        }

        const totalInvoices =
    result.paidInvoices +
    result.pendingInvoices +
    result.overdueInvoices;

const chartContainer =
    document.getElementById("invoiceStatusChartContainer");

const emptyState =
    document.getElementById("invoiceStatusEmpty");

const legend =
    document.getElementById("invoiceStatusLegend");

if (totalInvoices === 0) {

    if (invoiceStatusChart) {
        invoiceStatusChart.destroy();
        invoiceStatusChart = null;
    }

    chartContainer.style.display = "none";
    legend.style.display = "none";
    emptyState.style.display = "flex";

    return;
}

chartContainer.style.display = "block";
legend.style.display = "block";
emptyState.style.display = "none";



        invoiceStatusChart = new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: [

                    "Paid",

                    "Pending",

                    "Overdue"

                ],

                datasets: [{

                    data: [

                        result.paidInvoices,

                        result.pendingInvoices,

                        result.overdueInvoices

                    ],

                    backgroundColor: [

                        "#10B981",

                        "#F59E0B",

                        "#EF4444"

                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "70%",

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });



    }

    catch (error) {

    console.error(
        "Invoice Status Error:",
        error
    );

    showDashboardError(
        error.message ||
        "Unable to load invoice status."
    );

}

}

async function loadRecentInvoices() {

    try {

        const result = await Parse.Cloud.run("getInvoices", {
    page: 1,
    limit: 5,
    search: "",
    status: "all",
    date: "all",
    sort: "newest"
});

        const tableBody =
            document.getElementById(
                "recentInvoicesBody"
            );

        tableBody.innerHTML = "";

        if (result.invoices.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="6"
                        style="text-align:center;padding:30px;">

                        No invoices found.

                    </td>

                </tr>

            `;

            return;

        }

        result.invoices.forEach(invoice => {

            let statusClass = "pendingStatus";

            if (invoice.status === "Paid") {

                statusClass = "paidStatus";

            }

            else if (invoice.status === "Overdue") {

                statusClass = "overdueStatus";

            }

            const invoiceClientName =
                invoice.contactPerson || "-";

            const invoiceClientImage =
                invoice.clientImageUrl || "";

            const invoiceClientInitials =
                invoiceClientName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(name => name.charAt(0).toUpperCase())
                    .join("") || "?";

            const invoiceClientDisplay =
    showClientImage
        ? (
            invoiceClientImage
                ? `<img src="${invoiceClientImage}" alt="${invoiceClientName}" class="dashboardClientImage">`
                : `<span class="dashboardClientInitials">${invoiceClientInitials}</span>`
        )
        : "";
            tableBody.innerHTML += `

                <tr>

                    <td>${invoice.invoiceNumber}</td>

                   <td>
                        <div class="dashboardClientCell">
                            ${invoiceClientDisplay}
                            <span>${invoiceClientName}</span>
                        </div>
                    </td>

                    <td>${invoice.currencySymbol}${Number(invoice.totalAmount).toLocaleString()}</td>

                    <td>

                        <span class="statusBadge ${statusClass}">

                            ${invoice.status}

                        </span>

                    </td>

                    <td>${new Date(invoice.issueDate).toLocaleDateString()}</td>

<td class="invoiceActions">

<button
    class="tableActionButton dashboardView"
    data-id="${invoice.objectId}">
    <i class="ri-eye-line"></i>
</button>

<button
    class="tableActionButton dashboardEdit"
    data-id="${invoice.objectId}">
    <i class="ri-edit-line"></i>
</button>

<button
    class="tableActionButton dashboardDuplicate"
    data-id="${invoice.objectId}">
    <i class="ri-stack-line"></i>
</button>

<button
    class="tableActionButton dashboardDelete"
    data-id="${invoice.objectId}">
    <i class="ri-delete-bin-line"></i>
</button>

</td>

                </tr>

            `;

        });

    }

    catch (error) {

    console.error(
        "Recent Invoices Error:",
        error
    );

    showDashboardError(
        error.message ||
        "Unable to load recent invoices."
    );

}

}

async function loadUpcomingReminders() {

    try {

        const result = await Parse.Cloud.run(
            "upcomingPaymentReminder"
        );

        const remindersList =
            document.getElementById(
                "remindersList"
            );

        if (!remindersList) {
            return;
        }

        remindersList.innerHTML = "";

        if (
            !result ||
            result.success !== true
        ) {
            throw new Error(
                "Unable to load upcoming payment reminders."
            );
        }

        const invoices =
            Array.isArray(result.invoices)
                ? result.invoices.slice(0, 5)
                : [];

        if (invoices.length === 0) {

            remindersList.innerHTML = `

                <div class="reminderItem">

                    <div class="reminderDot"></div>

                    <div>

                        <h4>
                            No upcoming payments
                        </h4>

                        <p>
                            You have no pending payments due within the next ${result.reminderDays || 3} days.
                        </p>

                    </div>

                </div>

            `;

            return;
        }

        invoices.forEach(invoice => {

            const title =
                invoice.invoiceTitle ||
                invoice.invoiceNumber ||
                "Upcoming payment";

            const project =
                invoice.projectName ||
                invoice.companyName ||
                "";

            const message =
                invoice.reminderMessage ||
                "";

            const amount =
                invoice.totalAmount != null
                    ? `${invoice.currencySymbol || invoice.currencyCode || ""}${Number(invoice.totalAmount).toLocaleString()}`
                    : "";

            const subtitleParts = [
                project,
                amount,
                message
            ].filter(Boolean);

            remindersList.innerHTML += `

                <div class="reminderItem">

                    <div class="reminderDot"></div>

                    <div>

                        <h4>
                            ${title}
                        </h4>

                        <p>
                            ${subtitleParts.join(" • ")}
                        </p>

                    </div>

                </div>

            `;

        });

    }
    catch (error) {

        console.error(
            "Upcoming Payment Reminders Error:",
            error
        );

        const remindersList =
            document.getElementById(
                "remindersList"
            );

        if (remindersList) {

            remindersList.innerHTML = `

                <div class="reminderItem">

                    <div>

                        <h4>
                            Unable to load reminders
                        </h4>

                        <p>
                            ${error.message || "Please try again later."}
                        </p>

                    </div>

                </div>

            `;

        }

        if (
            typeof showDashboardError ===
            "function"
        ) {

            showDashboardError(
                error.message ||
                "Unable to load reminders."
            );

        }

    }

}

async function loadBusinessProfileSettings() {

    try {

        const result =
            await Parse.Cloud.run(
                "getBusinessProfile"
            );

        showClientImage =
            result &&
            result.profile &&
            result.profile.showClientImage !== false;

    }

    catch (error) {

        console.error(
            "Business Profile Settings Error:",
            error
        );

        showClientImage = true;

    }

}

retryDashboardButton.addEventListener("click", () => {

    loadDashboard();

});

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
);

deleteModalOverlay.addEventListener(
    "click",
    function(event){

        if(event.target === deleteModalOverlay){

            closeDeleteModal();

        }

    }
);

searchInput.addEventListener("input", function () {

    const searchText =
        this.value.toLowerCase().trim();

    const rows =
        document.querySelectorAll(
            "#recentInvoicesBody tr"
        );

    rows.forEach(row => {

        const rowText =
            row.textContent
            .toLowerCase();

        if (rowText.includes(searchText)) {

            row.style.display = "";

        }

        else {

            row.style.display = "none";

        }

    });

});

notificationButton.addEventListener("click", () => {

    window.location.href =
        "#";

});

viewAllEstimatesButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "estimates.html";

    }
);

document.getElementById("quickCreateInvoice")
.addEventListener("click", () =>{

    window.location.href =
    "invoice.html";

});

document.getElementById("quickAddClient")
.addEventListener("click", () =>{

    window.location.href =
    "clients.html";

});

document.getElementById("quickRecordPayment")
.addEventListener("click", () =>{

    window.location.href =
    "payments.html";

});

document.getElementById("quickCreateEstimate")
.addEventListener("click", () =>{

    window.location.href =
    "estimates.html";

});

confirmDeleteButton.addEventListener(
    "click",
    async function () {

        if (!selectedInvoiceId) {

            return;

        }

        try {

            confirmDeleteButton.disabled = true;

            confirmDeleteButton.textContent =
                "Deleting...";

            const result =
            await Parse.Cloud.run(
                "deleteInvoice",
                {
                    invoiceId:
                    selectedInvoiceId
                }
            );

            closeDeleteModal();

            await loadDashboardStatistics();

            await loadInvoiceStatus();

            await loadRecentInvoices();

            await loadUpcomingReminders();

        }

        catch (error) {

            showToast(
    error.message || "Unable to delete Invoice",
    "error"
);

        }

        finally {

            confirmDeleteButton.disabled = false;

            confirmDeleteButton.textContent =
                "Delete";

        }

    }
);

document.addEventListener("click", function (event) {

    const view = event.target.closest(".dashboardView");

    if (view) {

        window.location.href =
            `invoice.html?action=view&id=${view.dataset.id}`;

        return;

    }

    const edit = event.target.closest(".dashboardEdit");

    if (edit) {

        window.location.href =
            `invoice.html?action=edit&id=${edit.dataset.id}`;

        return;

    }

    const duplicate = event.target.closest(".dashboardDuplicate");

    if (duplicate) {

        window.location.href =
            `invoice.html?action=duplicate&id=${duplicate.dataset.id}`;

        return;

    }

    const del = event.target.closest(".dashboardDelete");

    if (del) {

    openDeleteModal(
        del.dataset.id
    );

    return;

}

    const estimateView =
    event.target.closest(
        ".dashboardEstimateView"
    );

if (estimateView) {

    window.location.href =
        `estimates.html?action=view&id=${encodeURIComponent(
            estimateView.dataset.id
        )}`;

    return;

}


const estimateEdit =
    event.target.closest(
        ".dashboardEstimateEdit"
    );

if (estimateEdit) {

    window.location.href =
        `estimates.html?action=edit&id=${encodeURIComponent(
            estimateEdit.dataset.id
        )}`;

    return;

}


const estimateDuplicate =
    event.target.closest(
        ".dashboardEstimateDuplicate"
    );

if (estimateDuplicate) {

    window.location.href =
        `estimates.html?action=duplicate&id=${encodeURIComponent(
            estimateDuplicate.dataset.id
        )}`;

    return;

}


const estimateDelete =
    event.target.closest(
        ".dashboardEstimateDelete"
    );

if (estimateDelete) {

    window.location.href =
        `estimates.html?action=delete&id=${encodeURIComponent(
            estimateDelete.dataset.id
        )}`;

    return;

}


const estimateConvert =
    event.target.closest(
        ".dashboardEstimateConvert"
    );

if (estimateConvert) {

    window.location.href =
        `estimates.html?action=convert&id=${encodeURIComponent(
            estimateConvert.dataset.id
        )}`;

    return;

}

});

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const authenticated =
            await handleGoogleAuthentication();

        if (authenticated) {

            await loadDashboard();

        }

    } catch (error) {

const errorMessage =
    error && error.message
        ? error.message
        : String(error);

showDashboardError(
    `Authentication error: ${errorMessage}`
);

}

});

dashboardClientImageStyle.textContent = `
.dashboardClientCell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dashboardClientImage,
.dashboardClientInitials {
    width: 34px;
    height: 34px;
    min-width: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.dashboardClientImage {
    object-fit: cover;
}

.dashboardClientInitials {
    background: #DCE6F5;
    color: #102A56;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
}
`;
document.head.appendChild(dashboardClientImageStyle);
