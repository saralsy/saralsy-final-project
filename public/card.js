
const stripe = Stripe('pk_test_51K1fmXJktgMJDJAoeptLVSKuuFxndcCEf8uY6wE8eLdBZGHQWF2mUhbSyqBZRFw6Am9UcuNFIeN22X7wraBxeuls00ettEtH93');
const elements = stripe.elements();
const style = {
    base: {
        color: "#fff"
    }
}

document.addEventListener('DOMContentLoaded', main);

function main(){
    console.log("running card.js");
    const card = elements.create('card');
    card.mount('#card-element');
    const form = document.querySelector('#paymentForm');
    const errorEl = document.querySelector('#card-errors');
    const stripeTokenHandler = token => {
        const hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', 'stripeToken');
        hiddenInput.setAttribute('value', token.id);
        form.appendChild(hiddenInput);
        console.log(form)
        form.submit();
    }
    form.addEventListener('submit', e => {
        e.preventDefault();
        stripe.createToken(card).then(res => {
            if (res.error) errorEl.textContent = res.error.message;
            else {
                console.log("stripe", res.token)
                stripeTokenHandler(res.token);
            }
        })
    })

}

