export function disposeObject3D(root, { disposeMaterials = true } = {}) {
  if (!root) return;
  root.traverse((object) => {
    object.geometry?.dispose?.();
    if (!disposeMaterials || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => value?.isTexture && value.dispose());
      material.dispose?.();
    });
  });
  root.removeFromParent();
}

export function disposeGeometryOnly(object) {
  object?.traverse?.((child) => child.geometry?.dispose?.());
  object?.removeFromParent?.();
}
