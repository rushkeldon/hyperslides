export function deleteNode(node : Node) {
  if( !node ) return;
  const trashbin = document.querySelector( '.trashbin' );
  if( !trashbin ) return;
  trashbin.appendChild( node );
  trashbin.innerHTML = '';
}
