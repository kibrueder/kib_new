/**
 * Contact + Newsletter form handlers (vanilla JS)
 */
const config = window.SITE_CONFIG || {};

function showEl(id) {
  document.getElementById(id)?.classList.remove('hidden');
}
function hideEl(id) {
  document.getElementById(id)?.classList.add('hidden');
}

function scrollToFormFeedback(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 100;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

// Lead forms: the full one on /kontakt/ and the short one on the homepage.
// Both post to the same Netlify form, so submissions land in one inbox.
function initLeadForm({ formId, fieldsId, successId, errorId }) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideEl(successId);
    hideEl(errorId);

    const fd = new FormData(form);
    const params = new URLSearchParams();
    fd.forEach((value, key) => {
      if (key === 'bot-field') return;
      params.set(key, typeof value === 'string' ? value.trim() : value);
    });
    params.set('form-name', 'contact');

    // Validate whatever the markup marks as required, so each form can differ.
    const errors = [];
    form.querySelectorAll('[required]').forEach((field) => {
      const value = String(params.get(field.name) || '');
      const invalid = field.type === 'email' ? !/\S+@\S+\.\S+/.test(value) : !value;
      if (invalid) errors.push(field.name);
    });

    form.querySelectorAll('[data-error]').forEach((el) => el.classList.add('hidden'));
    errors.forEach((name) => {
      form.querySelector(`[data-error="${name}"]`)?.classList.remove('hidden');
    });
    if (errors.length) {
      form.querySelector(`[name="${errors[0]}"]`)?.focus();
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    const original = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = (typeof window.t === 'function' && window.t('contact.form.submitting')) || 'Wird gesendet...';
    }

    try {
      const res = await fetch('/kontakt/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      form.reset();
      showEl(successId);
      hideEl(fieldsId);
      scrollToFormFeedback(successId);
    } catch (err) {
      console.error(err);
      showEl(errorId);
      scrollToFormFeedback(errorId);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    }
  });
}

initLeadForm({
  formId: 'contact-form',
  fieldsId: 'contact-form-fields',
  successId: 'contact-success',
  errorId: 'contact-error',
});

initLeadForm({
  formId: 'story-form',
  fieldsId: 'story-form-fields',
  successId: 'story-success',
  errorId: 'story-error',
});

// Newsletter form 
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideEl('newsletter-success');
    hideEl('newsletter-error');
    hideEl('newsletter-exists');

    const email = String(new FormData(newsletterForm).get('email') || '')
      .toLowerCase()
      .trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showEl('newsletter-error');
      return;
    }

    const btn = newsletterForm.querySelector('[type="submit"]');
    const original = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = (typeof window.t === 'function' && window.t('contact.form.submitting')) || 'Wird gesendet...';
    }

    try {
      if (config.supabaseUrl && config.supabaseAnonKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.7');
        const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        const { error } = await supabase.from('newsletter_subscriptions').insert({ email });
        if (error) {
          if (error.code === '23505') {
            showEl('newsletter-exists');
            return;
          }
          throw error;
        }
      }

      try {
        await fetch(config.newsletterWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            timestamp: new Date().toISOString(),
            source: 'newsletter_signup',
          }),
        });
      } catch (webhookErr) {
        console.error('Webhook error:', webhookErr);
      }

      newsletterForm.reset();
      showEl('newsletter-success');
    } catch (err) {
      console.error(err);
      showEl('newsletter-error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    }
  });
}
