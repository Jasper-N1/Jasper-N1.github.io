// The one site footer. Every page loads this file with a plain <script src="site-footer.js"></script> where the footer goes,
// and the footer is written in that place. Change the footer here only; site-footer.css holds its styles.
document.currentScript.insertAdjacentHTML("beforebegin", `
<footer class="foot" id="foot">
  <div class="foot-in">
    <div class="top">
      <div><h2>Your health,<br><em>in one living model.</em></h2><a class="go" href="./#s6">Build my free twin <span aria-hidden="true">→</span></a></div>
      <nav aria-label="Product"><h3>Product</h3><a href="./#s3">How it works</a><a href="./#fs">Your twin</a><a href="examples.html">Examples</a><a href="pricing.html">Pricing</a></nav>
      <nav aria-label="Company"><h3>Company</h3><a href="about.html">About us</a><a href="about.html#contact">Contact</a></nav>
      <nav aria-label="Resources"><h3>Resources</h3><a href="./#s7">FAQ</a><a href="https://trust.n1.care/">Trust Centre</a></nav>
      <nav aria-label="Legal"><h3>Legal</h3><a href="privacy.html">Privacy</a><a href="https://n1.care/terms.html">Terms of use</a></nav>
    </div>
    <div class="mark" aria-hidden="true">digitaltwin<span>.care</span></div>
    <div class="legal"><p>Your twin helps you understand your health. It is not a medical device and does not diagnose or treat any condition. Always talk to a qualified healthcare professional about medical decisions.</p><span>© 2026 digitaltwin.care</span></div>
  </div>
</footer>`);
