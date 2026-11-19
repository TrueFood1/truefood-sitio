(() => {
 const panel=document.querySelector('.receta-filtros');if(!panel)return;
 const select=document.querySelector('#receta-producto'),buttons=[...panel.querySelectorAll('[data-sabor]')],rows=[...document.querySelectorAll('.blog-item')],clear=document.querySelector('#receta-limpiar'),empty=document.querySelector('.receta-sin-resultados');let sabor='';
 function update(){let count=0;for(const row of rows){const show=(!select.value||row.dataset.productos.split(' ').includes(select.value))&&(!sabor||row.dataset.sabores.split(' ').includes(sabor));row.hidden=!show;if(show)count++}document.querySelector('#receta-cantidad').textContent=count+' '+(count===1?'receta':'recetas');clear.hidden=!select.value&&!sabor;empty.hidden=count>0;for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.sabor===sabor));}
 for(const button of buttons)button.addEventListener('click',()=>{sabor=button.dataset.sabor;update()});select.addEventListener('change',update);clear.addEventListener('click',()=>{select.value='';sabor='';update()});panel.hidden=false;update();
})();
