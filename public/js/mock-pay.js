async function paySalaryMock(employeeId, buttonEl) {
  if (!employeeId) return;

  const btn = buttonEl || null;
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';
  }

  try {
    const res = await fetch(`/pay-salary/${employeeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Payment failed.");
    }

    if (typeof bootstrap !== "undefined") {
      const toastEl = document.getElementById("paymentSuccessToast");
      if (toastEl) {
        toastEl.querySelector(".toast-body").textContent =
          data.message + (data.transactionId ? ` (${data.transactionId})` : "");
        new bootstrap.Toast(toastEl).show();
      }
    }

    setTimeout(() => {
      window.location.href = data.redirect || window.location.href;
    }, 1200);
  } catch (err) {
    alert(err.message || "Payment failed.");
    resetMockPayButton(btn);
  }
}

function resetMockPayButton(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
}

document.addEventListener("click", (e) => {
  const payBtn = e.target.closest("[data-pay-salary-mock]");
  if (!payBtn) return;
  e.preventDefault();
  paySalaryMock(payBtn.dataset.employeeId, payBtn);
});
