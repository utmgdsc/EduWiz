from manim import *

class TextManager:
    """
    A class for managing text scenes in Manim.
    """
    def __init__(self, scene: Scene) -> None:
        """
        Initialize a TextManager with the given Scene.
        """
        self.scene = scene
        self.text = []

        self.frame_width = config.frame_width
        self.frame_height = config.frame_height

        self.x_min = -self.frame_width / 2
        self.x_max = self.frame_width / 2
        self.y_min = -self.frame_height / 2
        self.y_max = self.frame_height / 2

    def add_title(self, title: str):
        """
        Creates a title with the given text, adds it and writes it to the scene.
        """
        self.title = Tex(title, font_size = 60)
        self.title.to_edge(UP)

        self.text.append(self.title)

        self.scene.add(self.title)
        self.scene.play(Write(self.title))

    def add_text(self, text: str):
        """
        Add some text to the scene. 
        """
        t_object = Tex(text, font_size = 36)
        self.position(t_object)
        self.text.append(t_object)

        self.scene.add(t_object)
        self.scene.play(Write(t_object))
    
    def add_equation(self, equation: str):
        """
        Add a LaTeX equation to the scene. Requires valid LaTeX math mode code.
        """
        t_object = MathTex(equation, font_size = 36)
        self.position(t_object)
        self.text.append(t_object)

        self.scene.add(t_object)
        self.scene.play(Write(t_object))

    def position(self, object: Mobject):
        last_mob = self.text[-1] if self.text else None

        if not last_mob:
            object.to_edge(UP)
        elif last_mob == self.title:
            object.next_to(last_mob, direction=DOWN, buff=1)
        else:
            object.next_to(last_mob, direction=DOWN, buff=0.5)
        
        # Make sure its in bounds
        self._move_within_bounds(object)

    def clear_scene(self):
        """
        Clear the scene and start with a blank canvas. All text including the title is removed.
        """
        self.scene.play(*[FadeOut(mobj) for mobj in self.text])
        self.text = []

    def _check_within_bounds(self, object: Mobject):
        """
        Return whether the given Mobject is within the bounadries of the scene.
        """
        x_min = object.get_left()[0]
        x_max = object.get_right()[0]
        y_min = object.get_bottom()[1]
        y_max = object.get_top()[1]
        
        # If out of bounds
        if x_min < self.x_min or x_max > self.x_max:
            return False
        if y_min < self.y_min or y_max > self.y_max:
            return False
        
        # Else
        return True

    def _move_within_bounds(self, object: Mobject):
        """
        Move the given Mobject within the scenes boundaries.
        """
        
        if self._check_within_bounds(object):
            return

        x_min = object.get_left()[0]
        x_max = object.get_right()[0]
        y_min = object.get_bottom()[1]
        y_max = object.get_top()[1]

        # X-Axis case
        if x_min < self.x_min:
            object.shift(RIGHT * (self.x_min - x_min))
        elif x_max > self.x_max:
            object.shift(LEFT * (x_max - self.x_max))

        # Y-Axis case
        if y_min < self.y_min:
            object.shift(UP * (self.y_min - y_min))
        elif y_max > self.y_max:
            object.shift(DOWN * (y_max - self.y_max))
