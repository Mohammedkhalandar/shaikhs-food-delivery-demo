/* Original demo code: Copyright (c) 2026 Mohammedkhalandar. All Rights Reserved. Illustration rights remain separate under CC0. */
export const MENU = [
  {id:'biryani',name:'Meadow biryani bowl',description:'An illustrative rice bowl with warm spices.',price:24900,stock:4,category:'Main'},
  {id:'paneer-butter-masala',name:'Garden paneer',description:'A fictional kitchen favourite, shown as original artwork.',price:21900,stock:4,category:'Main'},
  {id:'burger',name:'The little lunch burger',description:'A playful illustrated classic for this walkthrough.',price:19900,stock:3,category:'Main'},
  {id:'masala-dosa',name:'Golden morning dosa',description:'An illustrated crisp dosa, entirely a demo item.',price:11900,stock:4,category:'Main'},
  {id:'chicken-65',name:'Spiced bites',description:'A small fictional plate for a leisurely lunch.',price:18900,stock:3,category:'Main'},
  {id:'gulab-jamun',name:'A sweet little finish',description:'Original dessert artwork. No real food is sold here.',price:9900,stock:4,category:'Treat'},
];
export const KITCHENS = [
  {id:'meadow',name:'Meadow Table',description:'Illustrative bowls and comforting mains.',items:['biryani','paneer-butter-masala']},
  {id:'lunch',name:'Little Lunch Club',description:'Playful lunch favourites and small plates.',items:['burger','chicken-65']},
  {id:'morning',name:'Morning & Mithai',description:'Golden breakfasts and a sweet finish.',items:['masala-dosa','gulab-jamun']},
];
export function filterMenu({query='',category='all',kitchen='all'}={}){
  const term=query.trim().toLocaleLowerCase('en-IN').slice(0,80);
  return MENU.filter(item=>(category==='all'||item.category===category)&&(kitchen==='all'||KITCHENS.find(k=>k.id===kitchen)?.items.includes(item.id))&&(`${item.name} ${item.description}`.toLocaleLowerCase('en-IN').includes(term)));
}
export function simulation(){
  let cart=new Map(),order=null;
  return {
    add(id){const item=MENU.find(p=>p.id===id);if(!item||order||(cart.get(id)||0)>=item.stock)return false;cart.set(id,(cart.get(id)||0)+1);return true;},
    remove(id){if(order)return false;const count=cart.get(id)||0;if(count<=1)cart.delete(id);else cart.set(id,count-1);return true;},
    snapshot(){const rows=MENU.filter(p=>cart.has(p.id)).map(p=>({...p,quantity:cart.get(p.id)}));const subtotal=rows.reduce((n,p)=>n+p.price*p.quantity,0);return {rows,subtotal,fee:rows.length?3500:0,total:subtotal+(rows.length?3500:0),order:order?{...order}:null};},
    place(){if(order)return {...order};const s=this.snapshot();if(!s.rows.length)return null;order={id:'SIMULATED-001',status:'QUEUED',total:s.total};return {...order};},
    advance(role,action){const rules={accept:['RESTAURANT','QUEUED','ACCEPTED'],prepare:['RESTAURANT','ACCEPTED','PREPARING'],ready:['RESTAURANT','PREPARING','READY'],pickup:['RIDER','READY','PICKED_UP'],deliver:['RIDER','PICKED_UP','DELIVERED'],reconcile:['ADMIN','DELIVERED','RECONCILED']};const rule=rules[action];if(!order||!rule||role!==rule[0]||order.status!==rule[1])return false;order={...order,status:rule[2]};return true;},
    reset(){cart=new Map();order=null;},
  };
}
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n/100);
if(typeof document!=='undefined'){
  const demo=simulation(),byId=id=>document.getElementById(id),cart=byId('cart');
  let renderedProducts=null;
  function feedback(text){byId('feedback').textContent=text;}
  function render(){
    const s=demo.snapshot(),role=byId('role').value;
    const visible=filterMenu({query:byId('search').value,category:byId('category').value,kitchen:byId('kitchen').value});
    const key=visible.map(p=>p.id).join(',');
    byId('cart-count').textContent=s.rows.reduce((n,p)=>n+p.quantity,0);
    // Preserve card nodes on basket/role updates so keyboard focus and decoded images survive.
    if(renderedProducts!==key){
      byId('products').innerHTML=visible.map(p=>`<article class="card"><img src="assets/${p.id}.jpg" alt="Original illustration of ${p.name}" width="640" height="480" loading="lazy" decoding="async"><div class="card-content"><h3>${p.name}</h3><p>${p.description}</p><span class="stock" data-stock="${p.id}"></span><div class="card-bottom"><b>${money(p.price)}</b><button class="outline" data-add="${p.id}" aria-label="Add ${p.name}">Add +</button></div></div></article>`).join('');
      renderedProducts=key;
    }
    for(const p of visible){const quantity=s.rows.find(r=>r.id===p.id)?.quantity||0;byId('products').querySelector(`[data-stock="${p.id}"]`).textContent=`Demo stock: ${p.stock-quantity}`;byId('products').querySelector(`[data-add="${p.id}"]`).disabled=!!s.order||quantity>=p.stock;}
    byId('results-count').textContent=`${visible.length} illustrative ${visible.length===1?'dish':'dishes'} shown`;
    byId('empty-menu').hidden=visible.length>0;
    byId('clear-filters').disabled=!byId('search').value&&byId('category').value==='all'&&byId('kitchen').value==='all';
    byId('cart-items').innerHTML=s.rows.length?s.rows.map(p=>`<div class="cart-row"><span>${p.name}<br>${money(p.price*p.quantity)}</span><div class="cart-controls"><button class="outline" data-remove="${p.id}" aria-label="Remove one ${p.name}" ${s.order?'disabled':''}>−</button><b>${p.quantity}</b><button class="outline" data-cart-add="${p.id}" aria-label="Add one ${p.name}" ${s.order||p.quantity>=p.stock?'disabled':''}>+</button></div></div>`).join(''):'<p>Your demo basket is empty. Explore the illustrative menu.</p>';
    byId('totals').textContent=`Illustrative subtotal ${money(s.subtotal)} + delivery ${money(s.fee)} = ${money(s.total)}. No charge is made.`;
    byId('place-order').disabled=!s.rows.length||!!s.order;
    byId('order-summary').textContent=s.order?`${s.order.id} · ${s.order.status.replaceAll('_',' ')} · ${money(s.order.total)} · simulation only; no payment or real fulfilment. Use Reset demo to start again.`:'Add a dish and simulate a COD order. Switch preview roles to follow preparation, delivery and reconciliation.';
    const actions=[['RESTAURANT','QUEUED','accept','Simulate acceptance'],['RESTAURANT','ACCEPTED','prepare','Simulate preparation'],['RESTAURANT','PREPARING','ready','Simulate ready for pickup'],['RIDER','READY','pickup','Simulate pickup'],['RIDER','PICKED_UP','deliver','Simulate delivery'],['ADMIN','DELIVERED','reconcile','Simulate COD reconciliation']];
    const allowed=actions.filter(a=>a[0]===role&&a[1]===s.order?.status);
    byId('role-actions').innerHTML=allowed.length?allowed.map(a=>`<button class="solid" data-action="${a[2]}">${a[3]}</button>`).join(''):`<p class="caption">${role==='CUSTOMER'?'Customer preview: use the basket to begin.':'This role has no available simulated action at the current step.'}</p>`;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.add){if(demo.add(button.dataset.add))feedback('Added to your fictional demo basket.');render();}
    if(button.dataset.remove||button.dataset.cartAdd){const id=button.dataset.remove||button.dataset.cartAdd;if(button.dataset.remove)demo.remove(id);else demo.add(id);render();(byId('cart-items').querySelector(`[data-${button.dataset.remove?'remove':'cart-add'}="${id}"]:not(:disabled)`)||byId('close-cart')).focus();}
    if(button.dataset.action){demo.advance(byId('role').value,button.dataset.action);feedback('Simulation updated. No real operational action occurred.');render();(byId('role-actions').querySelector('button')||byId('role')).focus();}
    if(button.dataset.kitchen){byId('kitchen').value=button.dataset.kitchen;byId('search').value='';byId('category').value='all';render();location.hash='menu';byId('search').focus({preventScroll:true});}
  });
  byId('open-cart').addEventListener('click',()=>{render();cart.showModal();});
  byId('close-cart').addEventListener('click',()=>cart.close());
  byId('place-order').addEventListener('click',()=>{if(demo.place()){cart.close();feedback('Simulated COD order created in this page only. Preview Restaurant to continue.');render();}});
  function clearFilters(){byId('search').value='';byId('category').value='all';byId('kitchen').value='all';render();}
  byId('reset').addEventListener('click',()=>{demo.reset();byId('role').value='CUSTOMER';clearFilters();feedback('Demo cleared. No server records existed.');});
  byId('clear-filters').addEventListener('click',()=>{clearFilters();byId('search').focus();});
  byId('restaurants-list').innerHTML=KITCHENS.map(k=>`<article class="kitchen-card"><span class="eyebrow">FICTIONAL KITCHEN</span><h3>${k.name}</h3><p>${k.description}</p><button class="outline" data-kitchen="${k.id}" aria-label="Explore ${k.name}">Explore this kitchen ↗</button></article>`).join('');
  byId('role').addEventListener('change',render);byId('category').addEventListener('change',render);byId('kitchen').addEventListener('change',render);byId('search').addEventListener('input',render);render();
}
