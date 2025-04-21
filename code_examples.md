### 1. WebGL

- **Animacje**

  - Animacje klatek kluczowych
  - Animacje szkieletowe (skinning)
  - Animacje morfingu
  - Animacje wielokrotne
  - Animacje chodu

- **Kamera**

  - Podstawowa kamera
  - Tablica kamer
  - Bufor głębi logarytmicznej

- **Geometria**

  - Różne typy geometrii (kostka, teren, tekst, itp.)
  - Geometria dynamiczna
  - Geometria instancjonowana
  - Geometria buforowa

- **Materiały i tekstury**

  - Różne typy materiałów
  - Mapy normalne i bump mapy
  - Mapy środowiskowe
  - Materiały fizyczne
  - Tekstury wideo

- **Oświetlenie**

  - Różne typy świateł
  - Światła punktowe
  - Światła spotowe
  - Światła prostokątne

- **Ładowanie modeli**
  - Obsługa różnych formatów (glTF, OBJ, FBX, itp.)
  - Ładowanie tekstur
  - Ładowanie czcionek

### 2. CSS3D

- Etykiety CSS2D
- Molekuły CSS3D
- Widok ortogonalny
- Tablica okresowa pierwiastków
- Sprite'y CSS3D
- Integracja z YouTube

### 3. Fizyka

- Fizyka z Ammo.js

  - Zniszczenia
  - Tkaniny
  - Instancjonowanie
  - Liny
  - Teren
  - Objętości

- Fizyka z Jolt

  - Instancjonowanie

- Fizyka z Rapier
  - Instancjonowanie

### 4. Audio

- Orientacja dźwięku
- Wizualizacja dźwięku
- Timing audio
- Sandbox audio

### 5. Różne

- Grupy animacji
- Klucze animacji
- Zaznaczanie obszaru
- Kontrolery (orbit, trackball, fly, itp.)
- Eksport (glTF, OBJ, STL, itp.)
- Raycasting
- Testy UV

### 6. SVG

- Linie SVG
- Sandbox SVG

## Struktura katalogów

- `/examples` - główny katalog z przykładami
- `/examples/files` - pliki pomocnicze
- `/examples/fonts` - czcionki
- `/examples/ies` - pliki IES dla świateł
- `/examples/jsm` - moduły JavaScript
- `/examples/luts` - tablice LUT
- `/examples/models` - modele 3D
- `/examples/screenshots` - zrzuty ekranu przykładów
- `/examples/sounds` - pliki dźwiękowe
- `/examples/textures` - tekstury

## Pliki konfiguracyjne

- `files.json` - lista wszystkich przykładów pogrupowanych w kategorie
- `tags.json` - tagi dla przykładów
- `main.css` - style CSS dla interfejsu przykładów

## Lista plików i ich zawartość

### Pliki WebGL

- `webgl_animation_keyframes.html` - Demonstracja animacji z wykorzystaniem klatek kluczowych
- `webgl_animation_skinning_blending.html` - Przykład mieszania animacji szkieletowych
- `webgl_animation_skinning_additive_blending.html` - Dodatkowe mieszanie animacji szkieletowych
- `webgl_animation_skinning_ik.html` - Animacje z wykorzystaniem odwrotnej kinematyki
- `webgl_animation_skinning_morph.html` - Animacje morfingu
- `webgl_animation_multiple.html` - Wiele animacji jednocześnie
- `webgl_animation_walk.html` - Animacja chodu
- `webgl_camera.html` - Podstawowe operacje na kamerze
- `webgl_camera_array.html` - Wykorzystanie tablicy kamer
- `webgl_camera_logarithmicdepthbuffer.html` - Bufor głębi logarytmicznej
- `webgl_clipping.html` - Przycinanie geometrii
- `webgl_clipping_advanced.html` - Zaawansowane przycinanie
- `webgl_clipping_intersection.html` - Przycinanie z przecięciami
- `webgl_clipping_stencil.html` - Przycinanie z buforem szablonowym
- `webgl_decals.html` - Nakładanie dekalów na modele
- `webgl_depth_texture.html` - Tekstura głębi
- `webgl_effects_anaglyph.html` - Efekt anaglifowy
- `webgl_effects_ascii.html` - Efekt ASCII
- `webgl_effects_parallaxbarrier.html` - Efekt bariery paralaksy
- `webgl_effects_peppersghost.html` - Efekt ducha Peppera
- `webgl_geometries.html` - Różne typy geometrii
- `webgl_geometries_parametric.html` - Geometrie parametryczne
- `webgl_geometry_colors.html` - Kolory w geometrii
- `webgl_geometry_colors_lookuptable.html` - Tablice kolorów
- `webgl_geometry_convex.html` - Geometria wypukła
- `webgl_geometry_csg.html` - Operacje CSG na geometrii
- `webgl_geometry_cube.html` - Geometria sześcianu
- `webgl_geometry_dynamic.html` - Dynamiczna geometria
- `webgl_geometry_extrude_shapes.html` - Wytłaczanie kształtów
- `webgl_geometry_extrude_splines.html` - Wytłaczanie krzywych
- `webgl_geometry_minecraft.html` - Geometria w stylu Minecraft
- `webgl_geometry_nurbs.html` - Geometria NURBS
- `webgl_geometry_shapes.html` - Podstawowe kształty
- `webgl_geometry_spline_editor.html` - Edytor krzywych
- `webgl_geometry_teapot.html` - Model czajnika
- `webgl_geometry_terrain.html` - Generowanie terenu
- `webgl_geometry_terrain_raycast.html` - Raycasting na terenie
- `webgl_geometry_text.html` - Tekst 3D
- `webgl_geometry_text_shapes.html` - Kształty tekstu
- `webgl_geometry_text_stroke.html` - Obrys tekstu
- `webgl_helpers.html` - Pomocnicze obiekty
- `webgl_instancing_morph.html` - Instancjonowanie z morfingiem
- `webgl_instancing_dynamic.html` - Dynamiczne instancjonowanie
- `webgl_instancing_performance.html` - Wydajność instancjonowania
- `webgl_instancing_raycast.html` - Raycasting instancjonowanych obiektów
- `webgl_instancing_scatter.html` - Rozpraszanie instancji
- `webgl_interactive_buffergeometry.html` - Interaktywna geometria buforowa
- `webgl_interactive_cubes.html` - Interaktywne kostki
- `webgl_interactive_cubes_gpu.html` - Interaktywne kostki z GPU
- `webgl_interactive_cubes_ortho.html` - Interaktywne kostki w rzucie ortogonalnym
- `webgl_interactive_lines.html` - Interaktywne linie
- `webgl_interactive_points.html` - Interaktywne punkty
- `webgl_interactive_raycasting_points.html` - Raycasting punktów
- `webgl_interactive_voxelpainter.html` - Malowanie wokseli
- `webgl_layers.html` - Warstwy renderowania
- `webgl_lensflares.html` - Efekt flar soczewkowych
- `webgl_lightprobe.html` - Sondy świetlne
- `webgl_lightprobe_cubecamera.html` - Sondy świetlne z kamerą sześcienną
- `webgl_lights_hemisphere.html` - Światło półkuliste
- `webgl_lights_physical.html` - Fizyczne oświetlenie
- `webgl_lights_pointlights.html` - Światła punktowe
- `webgl_lights_spotlight.html` - Światło spotowe
- `webgl_lights_spotlights.html` - Wiele świateł spotowych
- `webgl_lights_rectarealight.html` - Światło prostokątne
- `webgl_lines_colors.html` - Kolorowe linie
- `webgl_lines_dashed.html` - Linie przerywane
- `webgl_lines_fat.html` - Grube linie
- `webgl_lines_fat_raycasting.html` - Raycasting grubych linii
- `webgl_lines_fat_wireframe.html` - Szkielet grubych linii
- `webgl_loader_3dm.html` - Ładowanie modeli 3DM
- `webgl_loader_3ds.html` - Ładowanie modeli 3DS
- `webgl_loader_3mf.html` - Ładowanie modeli 3MF
- `webgl_loader_3mf_materials.html` - Ładowanie modeli 3MF z materiałami
- `webgl_loader_amf.html` - Ładowanie modeli AMF
- `webgl_loader_bvh.html` - Ładowanie animacji BVH
- `webgl_loader_collada.html` - Ładowanie modeli Collada
- `webgl_loader_collada_kinematics.html` - Ładowanie kinematyki Collada
- `webgl_loader_collada_skinning.html` - Ładowanie skinningu Collada
- `webgl_loader_draco.html` - Ładowanie modeli Draco
- `webgl_loader_fbx.html` - Ładowanie modeli FBX
- `webgl_loader_fbx_nurbs.html` - Ładowanie NURBS z FBX
- `webgl_loader_gcode.html` - Ładowanie G-code
- `webgl_loader_gltf.html` - Ładowanie modeli glTF
- `webgl_loader_gltf_avif.html` - Ładowanie glTF z AVIF
- `webgl_loader_gltf_compressed.html` - Ładowanie skompresowanych glTF
- `webgl_loader_gltf_dispersion.html` - Ładowanie glTF z dyspersją
- `webgl_loader_gltf_instancing.html` - Ładowanie instancjonowanych glTF
- `webgl_loader_gltf_iridescence.html` - Ładowanie glTF z irydescencją
- `webgl_loader_gltf_sheen.html` - Ładowanie glTF z połyskiem
- `webgl_loader_gltf_transmission.html` - Ładowanie glTF z transmisją
- `webgl_loader_gltf_variants.html` - Ładowanie glTF z wariantami
- `webgl_loader_gltf_anisotropy.html` - Ładowanie glTF z anizotropią
- `webgl_loader_ifc.html` - Ładowanie modeli IFC
- `webgl_loader_imagebitmap.html` - Ładowanie bitmap
- `webgl_loader_kmz.html` - Ładowanie modeli KMZ
- `webgl_loader_ldraw.html` - Ładowanie modeli LDraw
- `webgl_loader_lwo.html` - Ładowanie modeli LWO
- `webgl_loader_md2.html` - Ładowanie modeli MD2
- `webgl_loader_md2_control.html` - Kontrola modeli MD2
- `webgl_loader_mdd.html` - Ładowanie animacji MDD
- `webgl_loader_nrrd.html` - Ładowanie danych NRRD
- `webgl_loader_obj.html` - Ładowanie modeli OBJ
- `webgl_loader_obj_mtl.html` - Ładowanie modeli OBJ z materiałami
- `webgl_loader_pcd.html` - Ładowanie chmur punktów PCD
- `webgl_loader_pdb.html` - Ładowanie modeli PDB
- `webgl_loader_ply.html` - Ładowanie modeli PLY
- `webgl_loader_stl.html` - Ładowanie modeli STL
- `webgl_loader_svg.html` - Ładowanie SVG
- `webgl_loader_texture_dds.html` - Ładowanie tekstur DDS
- `webgl_loader_texture_exr.html` - Ładowanie tekstur EXR
- `webgl_loader_texture_ultrahdr.html` - Ładowanie tekstur UltraHDR
- `webgl_loader_texture_hdr.html` - Ładowanie tekstur HDR
- `webgl_loader_texture_ktx.html` - Ładowanie tekstur KTX
- `webgl_loader_texture_ktx2.html` - Ładowanie tekstur KTX2
- `webgl_loader_texture_lottie.html` - Ładowanie animacji Lottie
- `webgl_loader_texture_pvrtc.html` - Ładowanie tekstur PVRTC
- `webgl_loader_texture_rgbm.html` - Ładowanie tekstur RGBM
- `webgl_loader_texture_tga.html` - Ładowanie tekstur TGA
- `webgl_loader_texture_tiff.html` - Ładowanie tekstur TIFF
- `webgl_loader_ttf.html` - Ładowanie czcionek TTF
- `webgl_loader_usdz.html` - Ładowanie modeli USDZ
- `webgl_loader_vox.html` - Ładowanie modeli VOX
- `webgl_loader_vrml.html` - Ładowanie modeli VRML
- `webgl_loader_vtk.html` - Ładowanie modeli VTK
- `webgl_loader_xyz.html` - Ładowanie modeli XYZ
- `webgl_lod.html` - Poziomy szczegółowości
- `webgl_marchingcubes.html` - Algorytm Marching Cubes
- `webgl_materials_alphahash.html` - Materiały z hashowaniem alfa
- `webgl_materials_blending.html` - Mieszanie materiałów
- `webgl_materials_blending_custom.html` - Własne mieszanie materiałów
- `webgl_materials_bumpmap.html` - Mapy wypukłości
- `webgl_materials_car.html` - Materiały samochodowe
- `webgl_materials_channels.html` - Kanały materiałów
- `webgl_materials_cubemap.html` - Mapy sześcienne
- `webgl_materials_cubemap_dynamic.html` - Dynamiczne mapy sześcienne
- `webgl_materials_cubemap_refraction.html` - Refrakcja map sześciennych
- `webgl_materials_cubemap_mipmaps.html` - Mipmapy map sześciennych
- `webgl_materials_cubemap_render_to_mipmaps.html` - Renderowanie do mipmap
- `webgl_materials_displacementmap.html` - Mapy przemieszczenia
- `webgl_materials_envmaps.html` - Mapy środowiskowe
- `webgl_materials_envmaps_exr.html` - Mapy środowiskowe EXR
- `webgl_materials_envmaps_groundprojected.html` - Rzutowane mapy środowiskowe
- `webgl_materials_envmaps_hdr.html` - Mapy środowiskowe HDR
- `webgl_materials_matcap.html` - Materiały MatCap
- `webgl_materials_normalmap.html` - Mapy normalne
- `webgl_materials_normalmap_object_space.html` - Mapy normalne w przestrzeni obiektu
- `webgl_materials_physical_clearcoat.html` - Fizyczne materiały z powłoką
- `webgl_materials_physical_transmission.html` - Fizyczne materiały z transmisją
- `webgl_materials_physical_transmission_alpha.html` - Fizyczne materiały z transmisją i alfa
- `webgl_materials_subsurface_scattering.html` - Rozpraszanie podpowierzchniowe
- `webgl_materials_texture_anisotropy.html` - Anizotropia tekstur
- `webgl_materials_texture_canvas.html` - Tekstury z canvas
- `webgl_materials_texture_filters.html` - Filtry tekstur
- `webgl_materials_texture_manualmipmap.html` - Ręczne mipmapy
- `webgl_materials_texture_partialupdate.html` - Częściowa aktualizacja tekstur
- `webgl_materials_texture_rotation.html` - Rotacja tekstur
- `webgl_materials_toon.html` - Materiały toon
- `webgl_materials_video.html` - Materiały wideo
- `webgl_materials_video_webcam.html` - Materiały z kamerki internetowej
- `webgl_materials_wireframe.html` - Materiały z siatką
- `webgl_math_obb.html` - Obliczenia OBB
- `webgl_math_orientation_transform.html` - Transformacje orientacji
- `webgl_mesh_batch.html` - Grupowanie siatek
- `webgl_mirror.html` - Efekt lustra
- `webgl_modifier_curve.html` - Modyfikatory krzywych
- `webgl_modifier_curve_instanced.html` - Instancjonowane modyfikatory krzywych
- `webgl_modifier_edgesplit.html` - Podział krawędzi
- `webgl_modifier_simplifier.html` - Upraszczanie geometrii
- `webgl_modifier_subdivision.html` - Podział powierzchni
- `webgl_modifier_tessellation.html` - Tesselacja
- `webgl_morphtargets.html` - Cele morfingu
- `webgl_morphtargets_face.html` - Morfing twarzy
- `webgl_morphtargets_horse.html` - Morfing konia
- `webgl_morphtargets_sphere.html` - Morfing sfery
- `webgl_morphtargets_webcam.html` - Morfing z kamerki internetowej
- `webgl_multiple_elements.html` - Wiele elementów
- `webgl_multiple_elements_text.html` - Wiele elementów tekstowych
- `webgl_multiple_scenes_comparison.html` - Porównanie wielu scen
- `webgl_multiple_views.html` - Wiele widoków
- `webgl_panorama_cube.html` - Panorama sześcienna
- `webgl_panorama_equirectangular.html` - Panorama równokątna
- `webgl_points_billboards.html` - Punkty billboardowe
- `webgl_points_dynamic.html` - Dynamiczne punkty
- `webgl_points_sprites.html` - Sprite'y punktowe
- `webgl_points_waves.html` - Fale punktowe
- `webgl_portal.html` - Efekt portalu
- `webgl_random_uv.html` - Losowe UV
- `webgl_raycaster_bvh.html` - Raycaster z BVH
- `webgl_raycaster_sprite.html` - Raycaster sprite'ów
- `webgl_raycaster_texture.html` - Raycaster tekstur
- `webgl_read_float_buffer.html` - Odczyt bufora float
- `webgl_renderer_pathtracer.html` - Renderer ścieżkowy
- `webgl_refraction.html` - Refrakcja
- `webgl_rtt.html` - Renderowanie do tekstury
- `webgl_shader.html` - Podstawowe shadery
- `webgl_shader_lava.html` - Shader lawy
- `webgl_shaders_ocean.html` - Shadery oceanu
- `webgl_shaders_sky.html` - Shadery nieba
- `webgl_shadow_contact.html` - Kontakt cieni
- `webgl_shadowmap.html` - Mapy cieni
- `webgl_shadowmap_performance.html` - Wydajność map cieni
- `webgl_shadowmap_pointlight.html` - Mapy cieni światła punktowego
- `webgl_shadowmap_viewer.html` - Przeglądarka map cieni
- `webgl_shadowmap_vsm.html` - Mapy cieni VSM
- `webgl_shadowmesh.html` - Siatka cieni
- `webgl_sprites.html` - Sprite'y
- `webgl_test_memory.html` - Test pamięci
- `webgl_test_memory2.html` - Test pamięci 2
- `webgl_test_wide_gamut.html` - Test szerokiej gamy
- `webgl_tonemapping.html` - Mapowanie tonów
- `webgl_video_kinect.html` - Wideo z Kinect
- `webgl_video_panorama_equirectangular.html` - Panorama wideo równokątna
- `webgl_watch.html` - Zegar
- `webgl_water.html` - Woda
- `webgl_water_flowmap.html` - Woda z mapą przepływu

### Pliki CSS3D

- `css2d_label.html` - Etykiety CSS2D
- `css3d_molecules.html` - Molekuły CSS3D
- `css3d_orthographic.html` - Widok ortogonalny CSS3D
- `css3d_periodictable.html` - Tablica okresowa pierwiastków CSS3D
- `css3d_sandbox.html` - Sandbox CSS3D
- `css3d_sprites.html` - Sprite'y CSS3D
- `css3d_youtube.html` - Integracja z YouTube CSS3D

### Pliki Fizyki

- `physics_ammo_break.html` - Fizyka zniszczeń z Ammo.js
- `physics_ammo_cloth.html` - Fizyka tkanin z Ammo.js
- `physics_ammo_instancing.html` - Instancjonowanie z Ammo.js
- `physics_ammo_rope.html` - Fizyka lin z Ammo.js
- `physics_ammo_terrain.html` - Fizyka terenu z Ammo.js
- `physics_ammo_volume.html` - Fizyka objętości z Ammo.js
- `physics_jolt_instancing.html` - Instancjonowanie z Jolt
- `physics_rapier_instancing.html` - Instancjonowanie z Rapier

### Pliki Audio

- `webaudio_orientation.html` - Orientacja dźwięku
- `webaudio_sandbox.html` - Sandbox audio
- `webaudio_timing.html` - Timing audio
- `webaudio_visualizer.html` - Wizualizacja dźwięku

### Pliki Różne

- `misc_animation_groups.html` - Grupy animacji
- `misc_animation_keys.html` - Klucze animacji
- `misc_boxselection.html` - Zaznaczanie obszaru
- `misc_controls_arcball.html` - Kontroler Arcball
- `misc_controls_drag.html` - Kontroler przeciągania
- `misc_controls_fly.html` - Kontroler lotu
- `misc_controls_map.html` - Kontroler mapy
- `misc_controls_orbit.html` - Kontroler orbity
- `misc_controls_pointerlock.html` - Kontroler blokady wskaźnika
- `misc_controls_trackball.html` - Kontroler trackball
- `misc_controls_transform.html` - Kontroler transformacji
- `misc_exporter_draco.html` - Eksport Draco
- `misc_exporter_exr.html` - Eksport EXR
- `misc_exporter_gltf.html` - Eksport glTF
- `misc_exporter_ktx2.html` - Eksport KTX2
- `misc_exporter_obj.html` - Eksport OBJ
- `misc_exporter_ply.html` - Eksport PLY
- `misc_exporter_stl.html` - Eksport STL
- `misc_exporter_usdz.html` - Eksport USDZ
- `misc_lookat.html` - Funkcja lookAt
- `misc_raycaster_helper.html` - Pomocnik raycastingu
- `misc_uv_tests.html` - Testy UV

### Pliki SVG

- `svg_lines.html` - Linie SVG
- `svg_sandbox.html` - Sandbox SVG
