(function(){
  function $(sel, ctx=document){ return ctx.querySelector(sel); }
  function showErrors(list){
    const box = $('#form-errors');
    if (!box) return;
    box.innerHTML = '';
    if (list.length){
      box.classList.remove('visually-hidden');
      box.style.color = 'crimson';
      list.forEach(msg => {
        const p = document.createElement('p');
        p.textContent = msg;
        box.appendChild(p);
      });
    } else {
      box.textContent = '';
      box.classList.add('visually-hidden');
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      const name = $('#name');
      const phone = $('#phone');
      const email = $('#email');
      const comments = $('#comments');
      const errors = [];

      // Basic rules
      if (!name.value.trim() || name.value.trim().length < 2){
        errors.push('Please enter your name (at least 2 characters).');
      }
      if (!/^\d{10}$/.test(phone.value.trim())){
        errors.push('Phone number must be exactly 10 digits.');
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){
        errors.push('Please enter a valid email address.');
      }
      if (!comments.value.trim() || comments.value.trim().length < 5){
        errors.push('Please enter a brief message (at least 5 characters).');
      }

      if (errors.length){
        e.preventDefault();
        showErrors(errors);
        // Focus the first invalid field and highlight text
        const firstInvalid = (!name.value.trim() || name.value.trim().length < 2) ? name
                            : (!/^\d{10}$/.test(phone.value.trim())) ? phone
                            : (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) ? email
                            : comments;
        firstInvalid.focus();
        if (firstInvalid.select) firstInvalid.select();
      } else {
        showErrors([]);
        // Simulate submission by redirecting to home (as per instructions)
        e.preventDefault();
        window.location.href = 'index.html';
      }
    });
  });
})();